"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const metrics_service_1 = require("./metrics/metrics.service");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const helmet_1 = __importDefault(require("helmet"));
const hpp_1 = __importDefault(require("hpp"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express = __importStar(require("express"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { rawBody: true });
    const configService = app.get(config_1.ConfigService);
    const metricsService = app.get(metrics_service_1.MetricsService);
    // Initialize Sentry if available
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Sentry = await Promise.resolve().then(() => __importStar(require("@sentry/node")));
        const dsn = configService.get("SENTRY_DSN");
        if (Sentry && dsn) {
            Sentry.init({
                dsn,
                tracesSampleRate: 1.0,
            });
            app.use(Sentry.Handlers.requestHandler());
            app.use(Sentry.Handlers.tracingHandler());
        }
    }
    catch (e) {
        // Sentry not installed - continue without error tracking
    }
    // Custom middleware to handle express-mongo-sanitize compatibility with newer Express versions
    // Custom middleware to handle express-mongo-sanitize compatibility with newer Express versions
    const sanitizeMiddleware = (0, express_mongo_sanitize_1.default)();
    const safeMongoSanitize = (req, res, next) => {
        try {
            sanitizeMiddleware(req, res, next);
        }
        catch (error) {
            // If we get a "Cannot set property" error, fall back to sanitizing individually
            if (error.message.includes('Cannot set property') && error.message.includes('which has only a getter')) {
                // Sanitize each property individually to avoid setting getters
                if (req.body) {
                    req.body = express_mongo_sanitize_1.default.sanitize(req.body);
                }
                if (req.params) {
                    req.params = express_mongo_sanitize_1.default.sanitize(req.params);
                }
                if (req.query) {
                    // For query, we can't reassign the property but we can modify the object
                    // Create a sanitized version and copy properties
                    const sanitizedQuery = express_mongo_sanitize_1.default.sanitize(req.query);
                    // Clear existing properties and add sanitized ones
                    Object.keys(req.query).forEach(key => {
                        delete req.query[key];
                    });
                    Object.keys(sanitizedQuery).forEach(key => {
                        req.query[key] = sanitizedQuery[key];
                    });
                }
                next();
            }
            else {
                next(error);
            }
        }
    };
    // Security middleware
    app.use((0, helmet_1.default)());
    // Prevent NoSQL injection
    app.use(safeMongoSanitize);
    // Prevent HTTP parameter pollution
    app.use((0, hpp_1.default)());
    // Rate limiting to prevent abuse
    const apiLimiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    });
    app.use("/api/", apiLimiter);
    // Stricter rate limiting for auth endpoints
    const authLimiter = (0, express_rate_limit_1.default)({
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
            metricsService.observeHttpRequestDuration(req.method, req.route?.path || req.path, res.statusCode, duration);
        });
        next();
    });
    // Global validation pipe
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    await app.listen(3001);
}
bootstrap();
