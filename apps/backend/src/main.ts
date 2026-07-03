import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import * as Sentry from '@sentry/node';
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import * as express from "express";
import './reflect-metadata';
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import compression from "compression";
import { getAllowedOrigins } from "./security/cors-origin";
import { RedisRateLimitStore } from "./security/redis-rate-limit.store";
import { requireSecrets, MissingEnvError } from "./common/errors/missing-env.error";
import { csrfProtection } from "./security/csrf.middleware";
import { Counter, Histogram, Registry, collectDefaultMetrics } from "prom-client";

const metricsRegistry = new Registry();
collectDefaultMetrics({ register: metricsRegistry });

const httpRequestCounter = new Counter({
  name: "http_requests_total",
  help: "Total HTTP requests by method, route, and status code.",
  labelNames: ["method", "route", "status_code"] as const,
  registers: [metricsRegistry],
});

const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds.",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [metricsRegistry],
});

function getTrustProxySetting(configService: ConfigService): boolean {
  const value = configService.get<string>('TRUST_PROXY');
  if (value === undefined) {
    return false;
  }

  return !['0', 'false', 'no', 'off'].includes(value.toLowerCase());
}

function validateProductionEnvironment(configService: ConfigService): void {
  if (configService.get<string>('NODE_ENV') !== 'production') {
    return;
  }

  requireSecrets([
    'JWT_SECRET',
    'ENCRYPTION_SECRET',
    'DB_HOST',
    'DB_USER',
    'DB_PASS',
    'DB_NAME',
    'MONGO_URI',
    'REDIS_HOST',
    'REDIS_PORT',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'RAZORPAY_WEBHOOK_SECRET',
    'CORS_ALLOWED_ORIGINS',
  ], configService);

  const corsOrigins = configService.get<string>('CORS_ALLOWED_ORIGINS', '') || '';
  if (!corsOrigins.trim() || corsOrigins.split(',').some((origin) => origin.trim() === '*' || origin.trim().includes('*'))) {
    throw new MissingEnvError(
      'CORS_ALLOWED_ORIGINS',
      'Set a comma-separated list of explicit production origins. Wildcards are not allowed.'
    );
  }
}

function getRedisRateLimitUrl(configService: ConfigService): string {
  return configService.get<string>('REDIS_RATE_LIMIT_URL')
    || configService.get<string>('REDIS_URL')
    || `redis://${configService.get<string>('REDIS_HOST', 'localhost')}:${configService.get<number>('REDIS_PORT', 6379)}`;
}

function getRateLimitWindow(configService: ConfigService, name: string, fallbackMs: number): number {
  return Number(configService.get<number>(`RATE_LIMIT_${name}_WINDOW_MS`, fallbackMs));
}

function getRateLimitMax(configService: ConfigService, name: string, fallbackMax: number): number {
  return Number(configService.get<number>(`RATE_LIMIT_${name}_MAX`, fallbackMax));
}

function createRateLimitStore(configService: ConfigService, namespace: string): RedisRateLimitStore {
  const requiredInProduction = configService.get<string>('RATE_LIMIT_REDIS_REQUIRED', 'true') !== 'false';
  const fallbackToMemory = process.env.NODE_ENV !== 'production' || !requiredInProduction;

  return new RedisRateLimitStore({
    redisUrl: getRedisRateLimitUrl(configService),
    prefix: `spicegarden:${namespace}`,
    fallbackToMemory,
  });
}

function createRateLimiter(configService: ConfigService, namespace: string, fallbackMax: number, fallbackWindowMs: number, skipSuccessfulRequests = false) {
  return rateLimit({
    windowMs: getRateLimitWindow(configService, namespace, fallbackWindowMs),
    max: getRateLimitMax(configService, namespace, fallbackMax),
    store: createRateLimitStore(configService, namespace),
    keyGenerator: getRateLimitKey,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    message: {
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please retry after the reset window.',
    },
  });
}

function getRateLimitKey(req: express.Request): string {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const route = req.path.split('/').filter(Boolean).slice(0, 3).join(':') || 'root';
  return `${req.method}:${route}:${ip}`;
}

function installRateLimiters(app: NestExpressApplication, configService: ConfigService): void {
  if (process.env.LOAD_TEST_MODE === 'true' && configService.get<string>('NODE_ENV') !== 'production') {
    return;
  }
  app.use('/auth/otp', createRateLimiter(configService, 'AUTH_OTP', 3, 10 * 60 * 1000));
  app.use('/auth/', createRateLimiter(configService, 'AUTH', 5, 15 * 60 * 1000, true));
  app.use(/\/orders/, createRateLimiter(configService, 'ORDERS', 10, 15 * 60 * 1000));
  app.use('/api/', createRateLimiter(configService, 'API', 100, 15 * 60 * 1000));
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);

  validateProductionEnvironment(configService);

  if (configService.get<string>('NODE_ENV') === 'production') {
    const server = app.getHttpAdapter().getInstance();
    server.set('trust proxy', 1);
  }

const dsn = configService.get<string>("SENTRY_DSN");
   if (dsn) {
     // Dynamically import Sentry for newer API compatibility
     const sentry = await import('@sentry/node');
     (sentry as any).init({
       dsn,
       tracesSampleRate: 1.0,
     });
     app.use((sentry as any).setupExpressErrorHandler());
   }

  // Custom middleware to handle express-mongo-sanitize compatibility with newer Express versions
  const sanitizeMiddleware = mongoSanitize();
  const safeMongoSanitize = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      sanitizeMiddleware(req, res, next);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      // If we get a "Cannot set property" error, fall back to sanitizing individually
      if (errorMessage.includes('Cannot set property') && errorMessage.includes('which has only a getter')) {
        // Sanitize each property individually to avoid setting getters
        if (req.body) {
          req.body = mongoSanitize.sanitize(req.body);
        }
        if (req.params) {
          req.params = mongoSanitize.sanitize(req.params);
        }
        if (req.query) {
          // For query, we can't reassign the property but we can modify the object
          // Create a sanitized version and copy properties
          const sanitizedQuery = mongoSanitize.sanitize(req.query);
          // Clear existing properties and add sanitized ones
          Object.keys(req.query).forEach(key => {
            delete req.query[key];
          });
          Object.keys(sanitizedQuery).forEach(key => {
            req.query[key] = sanitizedQuery[key];
          });
        }
        next();
      } else {
        next(error);
      }
    }
  };

  app.set('trust proxy', getTrustProxySetting(configService));
  app.disable('x-powered-by');
  app.enableCors({
    origin: getAllowedOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'Idempotency-Key', 'x-csrf-token'],
  });

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https:'],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [''],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));
  app.use(cookieParser());
  app.use(csrfProtection());
  app.use(safeMongoSanitize);
  app.use(hpp());
  app.use(compression());
  installRateLimiters(app, configService);

  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dangerousMethods = ['TRACE', 'TRACK', 'DEBUG', 'CONNECT'];
    if (dangerousMethods.includes(req.method)) {
      return res.status(405).json({ message: `Method ${req.method} not allowed`, error: 'Method Not Allowed' });
    }
    next();
  });

  app.use(express.json({ limit: configService.get<string>('BODY_SIZE_LIMIT', "10kb") }));
  app.use(express.urlencoded({ limit: configService.get<string>('BODY_SIZE_LIMIT', "10kb"), extended: true }));

  // Request timeout (30s) to prevent Slowloris and hung connections
  const requestTimeout = configService.get<number>('REQUEST_TIMEOUT_MS', 30000);
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.setTimeout(requestTimeout, () => {
      res.status(408).json({ message: 'Request timeout', error: 'Request Timeout' });
    });
    next();
  });

  // Prometheus metrics endpoint
  app.use("/metrics", async (_req: express.Request, res: express.Response) => {
    res.set("Content-Type", metricsRegistry.contentType);
    res.send(await metricsRegistry.metrics());
  });

  // Metrics middleware
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = (Date.now() - start) / 1000;
      const route = req.route?.path ? req.path : req.baseUrl || req.path;
      httpRequestCounter.inc({ method: req.method, route, status_code: res.statusCode });
      httpRequestDuration.observe({ method: req.method, route, status_code: res.statusCode }, duration);
      console.log(`[local-metrics] ${req.method} ${req.path} ${res.statusCode} ${Math.round(duration * 1000)}ms`);
    });
    next();
  });


  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  await app.listen(3001);
}

bootstrap();