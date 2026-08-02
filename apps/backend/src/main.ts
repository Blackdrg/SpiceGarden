import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe, ExceptionFilter, Catch, ArgumentsHost, Logger, VersioningType, VERSION_NEUTRAL } from "@nestjs/common";
import { AppDataSource } from "./db/data-source";
import { QueryFailedError } from "typeorm";
import helmet from "helmet";
import * as Sentry from '@sentry/node';
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import * as express from "express";
import { Response as ExpressResponse } from "express";
import './reflect-metadata';
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import compression from "compression";
import os from "os";
import { Server } from "http";
import { getAllowedOrigins } from "./security/cors-origin";
import { RedisRateLimitStore } from "./security/redis-rate-limit.store";
import { requireSecrets, MissingEnvError } from "./common/errors/missing-env.error";
import { csrfProtection } from "./security/csrf.middleware";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { MetricsService } from "./metrics/metrics.service";
import { otelSDK } from "./observability/otel.setup";

@Catch(QueryFailedError)
class QueryFailedErrorFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const message = exception.message || '';
    const isBadRequest =
      message.includes('invalid input syntax for type uuid') ||
      message.includes('violates') ||
      message.includes('duplicate key') ||
      message.includes('not present in table') ||
      message.includes('foreign key');

    if (isBadRequest) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<ExpressResponse>();
      response.status(400).json({
        statusCode: 400,
        message: 'Bad request: invalid or duplicate data',
        error: 'Bad Request'
      });
      return;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<ExpressResponse>();
    response.status(500).json({
      statusCode: 500,
      message: 'Database error',
      error: 'Internal Server Error'
    });
  }
}

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
    'REDIS_PASSWORD',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'RAZORPAY_WEBHOOK_SECRET',
    'CORS_ALLOWED_ORIGINS',
    'SMTP_PASS',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'FCM_SERVER_KEY',
    'SENDGRID_API_KEY',
    'GOOGLE_MAPS_API_KEY',
    'APP_URL',
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
  const explicit = configService.get<string>('REDIS_RATE_LIMIT_URL')
    || configService.get<string>('REDIS_URL');
  if (explicit) {
    return explicit;
  }

  const host = configService.get<string>('REDIS_HOST', '127.0.0.1');
  const port = configService.get<number>('REDIS_PORT', 6379);
  const password = configService.get<string>('REDIS_PASSWORD');
  const username = configService.get<string>('REDIS_USERNAME');

  if (password) {
    const auth = username ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}` : `:${encodeURIComponent(password)}`;
    return `redis://${auth}@${host}:${port}`;
  }

  return `redis://${host}:${port}`;
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
  app.use('/auth/forgot-password', createRateLimiter(configService, 'AUTH_PASSWORD_RESET', 3, 15 * 60 * 1000));
  app.use('/auth/verify-reset-code', createRateLimiter(configService, 'AUTH_VERIFY_RESET', 5, 15 * 60 * 1000));
  app.use('/auth/reset-password', createRateLimiter(configService, 'AUTH_RESET_PASSWORD', 3, 15 * 60 * 1000));
  app.use('/auth/otp', createRateLimiter(configService, 'AUTH_OTP', 3, 10 * 60 * 1000));
  app.use('/auth/', createRateLimiter(configService, 'AUTH', 5, 15 * 60 * 1000, true));
  app.use(/\/orders/, createRateLimiter(configService, 'ORDERS', 10, 15 * 60 * 1000));
  app.use('/api/', createRateLimiter(configService, 'API', 100, 15 * 60 * 1000));
}

function loadFileSecretsIntoEnv() {
  for (const [key, value] of Object.entries(process.env)) {
    if (key.endsWith('_FILE') && value) {
      try {
        const fs = require('fs');
        if (fs.existsSync(value)) {
          const envVarName = key.replace('_FILE', '');
          process.env[envVarName] = fs.readFileSync(value, 'utf8').trim();
        }
      } catch {
        // ignore file read errors during bootstrap
      }
    }
  }
}

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  loadFileSecretsIntoEnv();

  validateProductionEnvironment(configService);

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

  if (configService.get<boolean>("OTEL_ENABLED", false)) {
    otelSDK.start();
    logger.log("OpenTelemetry SDK started");
  }

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

  // Custom middleware to handle express-mongo-sanitize compatibility with newer Express versions
  const sanitizeMiddleware = mongoSanitize();
  const safeMongoSanitize = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      sanitizeMiddleware(req, res, next);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Cannot set property') && errorMessage.includes('which has only a getter')) {
        if (req.body) {
          req.body = mongoSanitize.sanitize(req.body);
        }
        if (req.params) {
          req.params = mongoSanitize.sanitize(req.params);
        }
        if (req.query) {
          const sanitizedQuery = mongoSanitize.sanitize(req.query);
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
      if (!res.headersSent) {
        res.status(408).json({ message: 'Request timeout', error: 'Request Timeout' });
      }
    });
    next();
  });

  // Prometheus metrics endpoint
  const metricsToken = configService.get<string>('METRICS_TOKEN');
  app.use("/metrics", async (req: express.Request, res: express.Response) => {
    if (metricsToken) {
      const auth = req.headers.authorization;
      if (auth !== `Bearer ${metricsToken}`) {
        return res.status(401).json({ message: 'Unauthorized', error: 'Invalid or missing metrics token' });
      }
    } else {
      const clientIp = req.ip || req.connection.remoteAddress || '';
      if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(clientIp) && req.hostname !== 'localhost') {
        return res.status(403).json({ message: 'Forbidden', error: 'Metrics endpoint restricted to localhost in production' });
      }
    }
    const metricsService = app.get(MetricsService);
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send(await metricsService.getMetrics());
  });

  // Metrics middleware
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = (Date.now() - start) / 1000;
      const route = req.route?.path ? req.path : req.baseUrl || req.path;
      const metricsService = app.get(MetricsService);
      metricsService.startTimer(req.method, route, res.statusCode);
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
  app.useGlobalFilters(new QueryFailedErrorFilter());

  const swaggerEnabled = configService.get<string>('SWAGGER_ENABLED', 'false') === 'true';
  if (swaggerEnabled) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('SpiceGarden API')
        .setDescription('Food delivery platform REST API — all routes are prefixed with /v1/')
        .setVersion('1.0')
        .addBearerAuth()
        .build(),
    );
    SwaggerModule.setup('v1/docs', app, document);
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  await app.listen(3001);
  const httpServer = app.getHttpAdapter().getInstance() as unknown as Server;
  const shutdownGracePeriod = parseInt(configService.get<string>("SHUTDOWN_GRACE_PERIOD_MS", "10000"));

  process.on("SIGTERM", () => {
    logger.log(`SIGTERM received — shutting down gracefully within ${shutdownGracePeriod}ms`);
    httpServer.close(() => {
      logger.log("HTTP server closed");
      process.exit(0);
    });
    setTimeout(() => {
      logger.error("Graceful shutdown timed out — forcing exit");
      process.exit(1);
    }, shutdownGracePeriod).unref();
  });

  process.on("SIGINT", () => {
    logger.log(`SIGINT received — shutting down gracefully within ${shutdownGracePeriod}ms`);
    httpServer.close(() => {
      logger.log("HTTP server closed");
      process.exit(0);
    });
    setTimeout(() => {
      logger.error("Graceful shutdown timed out — forcing exit");
      process.exit(1);
    }, shutdownGracePeriod).unref();
  });

  logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();