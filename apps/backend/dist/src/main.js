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
const local_dev_module_1 = require("./local-dev.module");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const helmet_1 = __importDefault(require("helmet"));
const hpp_1 = __importDefault(require("hpp"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express = __importStar(require("express"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const cors_origin_1 = require("./security/cors-origin");
const missing_env_error_1 = require("./common/errors/missing-env.error");
function getTrustProxySetting(configService) {
    const value = configService.get('TRUST_PROXY');
    if (value === undefined) {
        return true;
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
}
async function bootstrap() {
    const localMode = process.env.LOCAL_DB === 'sqlite' || (!process.env.DB_HOST && process.env.NODE_ENV !== 'production');
    const app = await core_1.NestFactory.create(localMode ? local_dev_module_1.LocalDevModule : app_module_1.AppModule, { rawBody: true });
    const configService = app.get(config_1.ConfigService);
    validateProductionEnvironment(configService);
    try {
        const Sentry = (await Promise.resolve().then(() => __importStar(require("@sentry/node"))));
        const dsn = configService.get("SENTRY_DSN");
        if (Sentry && dsn) {
            Sentry.init({
                dsn,
                tracesSampleRate: 1.0,
            });
            Sentry.Handlers && app.use(Sentry.Handlers.requestHandler());
            Sentry.Handlers && app.use(Sentry.Handlers.tracingHandler());
        }
    }
    catch (e) {
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
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'Idempotency-Key'],
    });
    app.use((0, helmet_1.default)());
    app.use(safeMongoSanitize);
    app.use((0, hpp_1.default)());
    const apiLimiter = (0, express_rate_limit_1.default)({
        windowMs: Number(configService.get('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000)),
        max: Number(configService.get('RATE_LIMIT_MAX', 100)),
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use("/api/", apiLimiter);
    const authLimiter = (0, express_rate_limit_1.default)({
        windowMs: Number(configService.get('AUTH_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000)),
        max: Number(configService.get('AUTH_RATE_LIMIT_MAX', 10)),
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use("/auth/", authLimiter);
    app.use(express.json({ limit: configService.get('BODY_SIZE_LIMIT', "10kb") }));
    app.use(express.urlencoded({ limit: configService.get('BODY_SIZE_LIMIT', "10kb"), extended: true }));
    app.use((req, res, next) => {
        const dangerousMethods = ['TRACE', 'TRACK', 'DEBUG', 'CONNECT'];
        if (dangerousMethods.includes(req.method)) {
            return res.status(405).json({ message: `Method ${req.method} not allowed`, error: 'Method Not Allowed' });
        }
        next();
    });
    app.use("/metrics", async (_req, res) => {
        res.set("Content-Type", "text/plain");
        res.send("spicegarden_backend_local_mode=true\n");
    });
    app.use((req, res, next) => {
        const start = Date.now();
        res.on("finish", () => {
            const duration = Date.now() - start;
            console.log(`[local-metrics] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
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
