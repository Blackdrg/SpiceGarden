"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseFailoverService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let DatabaseFailoverService = class DatabaseFailoverService {
    dataSource;
    state = {
        isPrimaryDown: false,
        failoverStartedAt: null,
        degradedMode: false,
        reconnectionAttempts: 0,
        lastSuccessfulConnection: new Date(),
    };
    maxReconnectionAttempts = 10;
    reconnectionDelayMs = 5000;
    healthCheckInterval = null;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    onModuleInit() {
        this.startHealthCheck();
    }
    onModuleDestroy() {
        this.stopHealthCheck();
    }
    startHealthCheck() {
        this.healthCheckInterval = setInterval(async () => {
            await this.performHealthCheck();
        }, 30000);
    }
    stopHealthCheck() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
    }
    async performHealthCheck() {
        const startTime = Date.now();
        try {
            await this.dataSource.query('SELECT 1');
            const latencyMs = Date.now() - startTime;
            this.state.lastSuccessfulConnection = new Date();
            this.state.reconnectionAttempts = 0;
            if (this.state.isPrimaryDown && latencyMs > 1000) {
                this.state.degradedMode = true;
            }
            else if (this.state.isPrimaryDown && latencyMs <= 500) {
                this.exitDegradedMode();
            }
            return { healthy: true, latencyMs, degraded: this.state.degradedMode };
        }
        catch (error) {
            const latencyMs = Date.now() - startTime;
            this.state.reconnectionAttempts++;
            if (!this.state.isPrimaryDown) {
                this.state.isPrimaryDown = true;
                this.state.failoverStartedAt = new Date();
            }
            if (this.state.reconnectionAttempts >= this.maxReconnectionAttempts) {
                this.state.degradedMode = true;
            }
            return { healthy: false, latencyMs, degraded: this.state.degradedMode };
        }
    }
    async attemptReconnection() {
        try {
            if (!this.dataSource.isInitialized) {
                await this.dataSource.initialize();
            }
            await this.dataSource.query('SELECT 1');
            this.exitDegradedMode();
            return true;
        }
        catch (error) {
            return false;
        }
    }
    exitDegradedMode() {
        this.state.isPrimaryDown = false;
        this.state.failoverStartedAt = null;
        this.state.degradedMode = false;
        this.state.reconnectionAttempts = 0;
    }
    getState() {
        return { ...this.state };
    }
    isDegraded() {
        return this.state.degradedMode;
    }
    getFailoverDuration() {
        if (!this.state.failoverStartedAt)
            return null;
        return Date.now() - this.state.failoverStartedAt.getTime();
    }
    async executeWithFallback(primaryQuery, fallbackQuery) {
        if (this.state.degradedMode) {
            try {
                return await fallbackQuery();
            }
            catch (fallbackError) {
                throw new Error(`Both primary and fallback queries failed: ${fallbackError}`);
            }
        }
        try {
            return await primaryQuery();
        }
        catch (primaryError) {
            if (this.state.reconnectionAttempts >= this.maxReconnectionAttempts) {
                try {
                    return await fallbackQuery();
                }
                catch (fallbackError) {
                    throw new Error(`Primary failed after max retries, fallback also failed: ${fallbackError}`);
                }
            }
            throw primaryError;
        }
    }
};
exports.DatabaseFailoverService = DatabaseFailoverService;
exports.DatabaseFailoverService = DatabaseFailoverService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], DatabaseFailoverService);
