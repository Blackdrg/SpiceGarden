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
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const helmet_1 = __importDefault(require("helmet"));
const hpp_1 = __importDefault(require("hpp"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express = __importStar(require("express"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_origin_1 = require("./security/cors-origin");
const redis_rate_limit_store_1 = require("./security/redis-rate-limit.store");
const missing_env_error_1 = require("./common/errors/missing-env.error");
const csrf_middleware_1 = require("./security/csrf.middleware");
const prom_client_1 = require("prom-client");
const metricsRegistry = new prom_client_1.Registry();
(0, prom_client_1.collectDefaultMetrics)({ register: metricsRegistry });
const httpRequestCounter = new prom_client_1.Counter({
    name: "http_requests_total",
    help: "Total HTTP requests by method, route, and status code.",
    labelNames: ["method", "route", "status_code"],
    registers: [metricsRegistry],
});
const httpRequestDuration = new prom_client_1.Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request duration in seconds.",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    registers: [metricsRegistry],
});
function getTrustProxySetting(configService) {
    const value = configService.get('TRUST_PROXY');
    if (value === undefined) {
        return false;
    }
    return !['0', 'false', 'no', 'off'].includes(value.toLowerCase());
}
function validateProductionEnvironment(configService) {
    if (configService.get('NODE_ENV') !== 'production') {
        return;
    }
    (0, missing_env_error_1.requireSecrets)([
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
    const corsOrigins = configService.get('CORS_ALLOWED_ORIGINS', '') || '';
    if (!corsOrigins.trim() || corsOrigins.split(',').some((origin) => origin.trim() === '*' || origin.trim().includes('*'))) {
        throw new missing_env_error_1.MissingEnvError('CORS_ALLOWED_ORIGINS', 'Set a comma-separated list of explicit production origins. Wildcards are not allowed.');
    }
}
function getRedisRateLimitUrl(configService) {
    return configService.get('REDIS_RATE_LIMIT_URL')
        || configService.get('REDIS_URL')
        || `redis://${configService.get('REDIS_HOST', 'localhost')}:${configService.get('REDIS_PORT', 6379)}`;
}
function getRateLimitWindow(configService, name, fallbackMs) {
    return Number(configService.get(`RATE_LIMIT_${name}_WINDOW_MS`, fallbackMs));
}
function getRateLimitMax(configService, name, fallbackMax) {
    return Number(configService.get(`RATE_LIMIT_${name}_MAX`, fallbackMax));
}
function createRateLimitStore(configService, namespace) {
    const requiredInProduction = configService.get('RATE_LIMIT_REDIS_REQUIRED', 'true') !== 'false';
    const fallbackToMemory = process.env.NODE_ENV !== 'production' || !requiredInProduction;
    return new redis_rate_limit_store_1.RedisRateLimitStore({
        redisUrl: getRedisRateLimitUrl(configService),
        prefix: `spicegarden:${namespace}`,
        fallbackToMemory,
    });
}
function createRateLimiter(configService, namespace, fallbackMax, fallbackWindowMs, skipSuccessfulRequests = false) {
    return (0, express_rate_limit_1.default)({
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
function getRateLimitKey(req) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const route = req.path.split('/').filter(Boolean).slice(0, 3).join(':') || 'root';
    return `${req.method}:${route}:${ip}`;
}
function installRateLimiters(app, configService) {
    if (process.env.LOAD_TEST_MODE === 'true' && configService.get('NODE_ENV') !== 'production') {
        return;
    }
    app.use('/auth/otp', createRateLimiter(configService, 'AUTH_OTP', 3, 10 * 60 * 1000));
    app.use('/auth/', createRateLimiter(configService, 'AUTH', 5, 15 * 60 * 1000, true));
    app.use(/\/orders/, createRateLimiter(configService, 'ORDERS', 10, 15 * 60 * 1000));
    app.use('/api/', createRateLimiter(configService, 'API', 100, 15 * 60 * 1000));
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { rawBody: true });
    const configService = app.get(config_1.ConfigService);
    validateProductionEnvironment(configService);
    if (configService.get('NODE_ENV') === 'production') {
        const server = app.getHttpAdapter().getInstance();
        server.set('trust proxy', 1);
    }
    const dsn = configService.get("SENTRY_DSN");
    if (dsn) {
        const sentry = await Promise.resolve().then(() => __importStar(require('@sentry/node')));
        sentry.init({
            dsn,
            tracesSampleRate: 1.0,
        });
        app.use(sentry.setupExpressErrorHandler());
    }
    const sanitizeMiddleware = (0, express_mongo_sanitize_1.default)();
    const safeMongoSanitize = (req, res, next) => {
        try {
            sanitizeMiddleware(req, res, next);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('Cannot set property') && errorMessage.includes('which has only a getter')) {
                if (req.body) {
                    req.body = express_mongo_sanitize_1.default.sanitize(req.body);
                }
                if (req.params) {
                    req.params = express_mongo_sanitize_1.default.sanitize(req.params);
                }
                if (req.query) {
                    const sanitizedQuery = express_mongo_sanitize_1.default.sanitize(req.query);
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
    app.set('trust proxy', getTrustProxySetting(configService));
    app.disable('x-powered-by');
    app.enableCors({
        origin: (0, cors_origin_1.getAllowedOrigins)(),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'Idempotency-Key', 'x-csrf-token'],
    });
    app.use((0, helmet_1.default)({
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
    app.use((0, cookie_parser_1.default)());
    app.use((0, csrf_middleware_1.csrfProtection)());
    app.use(safeMongoSanitize);
    app.use((0, hpp_1.default)());
    installRateLimiters(app, configService);
    app.use((req, res, next) => {
        const dangerousMethods = ['TRACE', 'TRACK', 'DEBUG', 'CONNECT'];
        if (dangerousMethods.includes(req.method)) {
            return res.status(405).json({ message: `Method ${req.method} not allowed`, error: 'Method Not Allowed' });
        }
        next();
    });
    app.use(express.json({ limit: configService.get('BODY_SIZE_LIMIT', "10kb") }));
    app.use(express.urlencoded({ limit: configService.get('BODY_SIZE_LIMIT', "10kb"), extended: true }));
    const requestTimeout = configService.get('REQUEST_TIMEOUT_MS', 30000);
    app.use((req, res, next) => {
        res.setTimeout(requestTimeout, () => {
            res.status(408).json({ message: 'Request timeout', error: 'Request Timeout' });
        });
        next();
    });
    app.use("/metrics", async (_req, res) => {
        res.set("Content-Type", metricsRegistry.contentType);
        res.send(await metricsRegistry.metrics());
    });
    app.use((req, res, next) => {
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
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    await app.listen(3001);
}
bootstrap();
