"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k) {
    if (k === undefined) k = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k, desc);
}) : (function(o, m, k, k) {
    if (k === undefined) k = k;
    o[k] = m[k];
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
        if (mod != null) for (var k = ownKeys(mod), i = ; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DockerManager = void ;
const child_process_ = require("child_process");
const path = __importStar(require("path"));
class DockerManager {
    storeManager;
    composeFile;
    constructor(storeManager) {
        this.storeManager = storeManager;
        this.composeFile = path.join(process.cwd(), 'compose.dev.yaml');
    }
    async isDockerInstalled() {
        return new Promise((resolve) => {
            const proc = (, child_process_.spawn)('docker', ['--version'], { shell: true });
            proc.on('close', (code) => resolve(code === ));
            proc.on('error', () => resolve(false));
        });
    }
    async isDockerRunning() {
        return new Promise((resolve) => {
            const proc = (, child_process_.spawn)('docker', ['info'], { shell: true });
            proc.on('close', (code) => resolve(code === ));
            proc.on('error', () => resolve(false));
        });
    }
    async getStatus() {
        const services = [
            { name: 'postgres', status: 'stopped', port:  },
            { name: 'redis', status: 'stopped', port:  },
            { name: 'mongo', status: 'stopped', port:  },
            { name: 'opensearch', status: 'stopped', port:  },
            { name: 'prometheus', status: 'stopped', port:  },
            { name: 'grafana', status: 'stopped', port:  },
            { name: 'alertmanager', status: 'stopped', port:  }
        ];
        for (const service of services) {
            const actualStatus = await this.getContainerStatus(service.name);
            service.status = actualStatus.status;
            service.containerId = actualStatus.containerId;
            service.health = actualStatus.health;
        }
        return services;
    }
    async getContainerStatus(serviceName) {
        return new Promise((resolve) => {
            const proc = (, child_process_.spawn)('docker', ['ps', '-a', '--filter', `name=${serviceName}`, '--format', '{{.ID}}|{{.Status}}'], {
                shell: true
            });
            let output = '';
            proc.stdout.on('data', (data) => (output += data.toString()));
            proc.on('close', () => {
                if (!output) {
                    resolve({ status: 'stopped', health: 'unknown' });
                    return;
                }
                const [containerId, status] = output.trim().split('|');
                if (status.includes('Up')) {
                    resolve({ status: 'running', containerId, health: 'healthy' });
                }
                else if (status.includes('Exited')) {
                    resolve({ status: 'stopped', containerId, health: 'unhealthy' });
                }
                else {
                    resolve({ status: 'error', containerId, health: 'unknown' });
                }
            });
            proc.on('error', () => resolve({ status: 'error', health: 'unknown' }));
        });
    }
    async startInfrastructure() {
        try {
            const isInstalled = await this.isDockerInstalled();
            if (!isInstalled) {
                return { success: false, error: 'Docker is not installed. Please install Docker Desktop.' };
            }
            const isRunning = await this.isDockerRunning();
            if (!isRunning) {
                return { success: false, error: 'Docker Desktop is not running. Please start Docker Desktop.' };
            }
            const proc = (, child_process_.spawn)('docker-compose', ['-f', this.composeFile, 'up', '-d'], {
                shell: true,
                cwd: path.dirname(this.composeFile)
            });
            return new Promise((resolve) => {
                let error = '';
                proc.stderr.on('data', (data) => (error += data.toString()));
                proc.on('close', (code) => {
                    resolve({ success: code === , error: code !==  ? error : undefined });
                });
            });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return { success: false, error: message };
        }
    }
    async stopInfrastructure() {
        try {
            const proc = (, child_process_.spawn)('docker-compose', ['-f', this.composeFile, 'down'], {
                shell: true,
                cwd: path.dirname(this.composeFile)
            });
            return new Promise((resolve) => {
                let error = '';
                proc.stderr.on('data', (data) => (error += data.toString()));
                proc.on('close', (code) => {
                    resolve({ success: code === , error: code !==  ? error : undefined });
                });
            });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return { success: false, error: message };
        }
    }
    async resetDatabases() {
        try {
            await this.stopInfrastructure();
            await new Promise((resolve) => setTimeout(resolve, ));
            await this.startInfrastructure();
            return { success: true };
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return { success: false, error: message };
        }
    }
}
exports.DockerManager = DockerManager;
