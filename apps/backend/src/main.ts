import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { LocalDevModule } from "./local-dev.module";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import * as express from "express";
import mongoSanitize from "express-mongo-sanitize";
import { getAllowedOrigins } from "./security/cors-origin";
import { requireSecrets } from "./common/errors/missing-env.error";

function getTrustProxySetting(configService: ConfigService): boolean {
  const value = configService.get<string>('TRUST_PROXY');
  if (value === undefined) {
    return true;
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
}

async function bootstrap() {
  const localMode = process.env.LOCAL_DB === 'sqlite' || (!process.env.DB_HOST && process.env.NODE_ENV !== 'production');
  const app = await NestFactory.create(localMode ? LocalDevModule : AppModule, { rawBody: true });
  const configService = app.get(ConfigService);

  validateProductionEnvironment(configService);

  try {
    const Sentry = (await import("@sentry/node")) as any;
    const dsn = configService.get<string>("SENTRY_DSN");
    if (Sentry && dsn) {
      Sentry.init({
        dsn,
        tracesSampleRate: 1.0,
      });
      Sentry.Handlers && app.use(Sentry.Handlers.requestHandler());
      Sentry.Handlers && app.use(Sentry.Handlers.tracingHandler());
    }
  } catch (e) {
    // Sentry not installed - continue without error tracking
  }

  // Custom middleware to handle express-mongo-sanitize compatibility with newer Express versions
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

  (app as any).set('trust proxy', getTrustProxySetting(configService));
  (app as any).disable('x-powered-by');
  app.enableCors({
    origin: getAllowedOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'Idempotency-Key'],
  });

  // Security middleware
  app.use(helmet());
  
  // Prevent NoSQL injection
  app.use(safeMongoSanitize);
  
  // Prevent HTTP parameter pollution
  app.use(hpp());
  
  // Rate limiting to prevent abuse
  const apiLimiter = rateLimit({
    windowMs: Number(configService.get<number>('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000)),
    max: Number(configService.get<number>('RATE_LIMIT_MAX', 100)),
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/", apiLimiter);
  
  // Stricter rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: Number(configService.get<number>('AUTH_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000)),
    max: Number(configService.get<number>('AUTH_RATE_LIMIT_MAX', 10)),
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/auth/", authLimiter);

// Body size limiting to prevent DoS
  app.use(express.json({ limit: configService.get<string>('BODY_SIZE_LIMIT', "10kb") }));
  app.use(express.urlencoded({ limit: configService.get<string>('BODY_SIZE_LIMIT', "10kb"), extended: true }));

  // Reject dangerous HTTP methods
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dangerousMethods = ['TRACE', 'TRACK', 'DEBUG', 'CONNECT'];
    if (dangerousMethods.includes(req.method)) {
      return res.status(405).json({ message: `Method ${req.method} not allowed`, error: 'Method Not Allowed' });
    }
    next();
  });

  // Prometheus metrics endpoint
  app.use("/metrics", async (_req: express.Request, res: express.Response) => {
    res.set("Content-Type", "text/plain");
    res.send("spicegarden_backend_local_mode=true\n");
  });

  // Metrics middleware
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(`[local-metrics] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
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