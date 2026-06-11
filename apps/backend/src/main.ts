import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MetricsService } from "./metrics/metrics.service";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import * as express from "express";
import mongoSanitize from "express-mongo-sanitize";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);
  const metricsService = app.get(MetricsService);

  // Initialize Sentry if available
  try {
    const Sentry = await import("@sentry/node");
    const dsn = configService.get<string>("SENTRY_DSN");
    if (Sentry && dsn) {
      Sentry.init({
        dsn,
        tracesSampleRate: 1.0,
      });
      app.use(Sentry.Handlers.requestHandler());
      app.use(Sentry.Handlers.tracingHandler());
    }
  } catch (e) {
    // Sentry not installed - continue without error tracking
  }

  // Custom middleware to handle express-mongo-sanitize compatibility with newer Express versions
  // Custom middleware to handle express-mongo-sanitize compatibility with newer Express versions
  const sanitizeMiddleware = mongoSanitize();
  const safeMongoSanitize = (req, res, next) => {
    try {
      sanitizeMiddleware(req, res, next);
    } catch (error) {
      // If we get a "Cannot set property" error, fall back to sanitizing individually
      if (error.message.includes('Cannot set property') && error.message.includes('which has only a getter')) {
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

  // Security middleware
  app.use(helmet());
  
  // Prevent NoSQL injection
  app.use(safeMongoSanitize);
  
  // Prevent HTTP parameter pollution
  app.use(hpp());
  
  // Rate limiting to prevent abuse
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
  app.use("/api/", apiLimiter);
  
  // Stricter rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/auth/", authLimiter);

  // Body size limiting to prevent DoS
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ limit: "10kb", extended: true }));

  // Prometheus metrics endpoint
  app.use("/metrics", async (req, res) => {
    res.set("Content-Type", "text/plain");
    res.send(await metricsService.getMetrics());
  });

  // Metrics middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      metricsService.observeHttpRequestDuration(
        req.method,
        req.route?.path || req.path,
        res.statusCode,
        duration
      );
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