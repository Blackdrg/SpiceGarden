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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
    try {
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
    }
    const sanitizeMiddleware = (0, express_mongo_sanitize_1.default)();
    const safeMongoSanitize = (req, res, next) => {
        try {
            sanitizeMiddleware(req, res, next);
        }
        catch (error) {
            if (error.message.includes('Cannot set property') && error.message.includes('which has only a getter')) {
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
    app.use((0, helmet_1.default)());
    app.use(safeMongoSanitize);
    app.use((0, hpp_1.default)());
    const apiLimiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use("/api/", apiLimiter);
    const authLimiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: 10,
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use("/auth/", authLimiter);
    app.use(express.json({ limit: "10kb" }));
    app.use(express.urlencoded({ limit: "10kb", extended: true }));
    app.use("/metrics", async (req, res) => {
        res.set("Content-Type", "text/plain");
        res.send(await metricsService.getMetrics());
    });
    app.use((req, res, next) => {
        const start = Date.now();
        res.on("finish", () => {
            const duration = Date.now() - start;
            metricsService.observeHttpRequestDuration(req.method, req.route?.path || req.path, res.statusCode, duration);
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
//# sourceMappingURL=main.js.map