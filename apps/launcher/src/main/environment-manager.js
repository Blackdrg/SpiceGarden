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
exports.EnvironmentManager = void ;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const child_process = __importStar(require("child_process"));
class EnvironmentManager {
    storeManager;
    ports = [
        { port: , service: 'Backend API' },
        { port: , service: 'PostgreSQL' },
        { port: , service: 'Redis' },
        { port: , service: 'MongoDB' },
        { port: , service: 'OpenSearch' },
        { port: , service: 'Prometheus' },
        { port: , service: 'Grafana' },
        { port: , service: 'OpenSearch Dashboards' },
        { port: , service: 'AlertManager' },
        { port: , service: 'Customer Web' },
        { port: , service: 'Restaurant Dashboard' },
        { port: , service: 'Admin Dashboard' }
    ];
    constructor(storeManager) {
        this.storeManager = storeManager;
    }
    async checkPrerequisites() {
        const checks = {
            dockerInstalled: false,
            dockerRunning: false,
            nodeVersion: process.versions.node,
            nodeSatisfies: false,
            portsAvailable: [],
            envExists: false,
            missingDependencies: []
        };
        checks.dockerInstalled = await this.checkDockerInstalled();
        checks.dockerRunning = await this.checkDockerRunning();
        checks.nodeSatisfies = this.checkNodeVersion();
        checks.portsAvailable = await this.checkPorts();
        checks.envExists = fs.existsSync(path.join(process.cwd(), '.env'));
        const nodeModulesPaths = ['apps/backend', 'apps/customer-web', 'apps/restaurant-dashboard', 'apps/super-admin'];
        for (const modulePath of nodeModulesPaths) {
            if (!fs.existsSync(path.join(process.cwd(), modulePath, 'node_modules'))) {
                checks.missingDependencies.push(modulePath);
            }
        }
        return checks;
    }
    checkDockerInstalled() {
        return new Promise((resolve) => {
            const proc = child_process.spawn('docker', ['--version'], { shell: true });
            proc.on('close', (code) => resolve(code === ));
            proc.on('error', () => resolve(false));
        });
    }
    checkDockerRunning() {
        return new Promise((resolve) => {
            const proc = child_process.spawn('docker', ['info'], { shell: true });
            proc.on('close', (code) => resolve(code === ));
            proc.on('error', () => resolve(false));
        });
    }
    checkNodeVersion() {
        const major = parseInt(process.versions.node.split('.')[]);
        return major >= ;
    }
    async checkPorts() {
        const results = [];
        for (const { port } of this.ports) {
            results.push({ port, available: await this.isPortAvailable(port) });
        }
        return results;
    }
    isPortAvailable(port) {
        return new Promise((resolve) => {
            const proc = child_process.spawn('netstat', ['-an'], { shell: true });
            let output = '';
            proc.stdout.on('data', (data) => (output += data.toString()));
            proc.on('close', () => {
                resolve(!output.includes(`:${port}`));
            });
            proc.on('error', () => resolve(true));
        });
    }
    checkAndGenerateEnv() {
        const envPath = path.join(process.cwd(), '.env');
        if (!fs.existsSync(envPath)) {
            this.generateEnv();
        }
    }
    async generateEnv() {
        let secrets = this.storeManager.getSecrets();
        if (!secrets) {
            this.generateSecrets();
            secrets = this.storeManager.getSecrets();
        }
        if (!secrets) {
            throw new Error('Failed to generate secrets for environment configuration.');
        }
        const envContent = this.buildEnvContent(secrets);
        const envPath = path.join(process.cwd(), '.env');
        fs.writeFileSync(envPath, envContent);
        const secretsPath = path.join(process.cwd(), 'secrets');
        if (!fs.existsSync(secretsPath)) {
            fs.mkdirSync(secretsPath, { recursive: true });
        }
        return { success: true, path: envPath };
    }
    generateSecrets() {
        const secretsDir = path.join(process.cwd(), 'secrets');
        if (!fs.existsSync(secretsDir)) {
            fs.mkdirSync(secretsDir, { recursive: true });
        }
        const secrets = {
            jwtSecret: crypto.randomBytes().toString('hex'),
            encryptionSecret: crypto.randomBytes().toString('hex'),
            dbPassword: crypto.randomBytes().toString('base'),
            stripeSecretKey: 'sk_test_' + crypto.randomBytes().toString('hex'),
            stripeWebhookSecret: 'whsec_' + crypto.randomBytes().toString('hex'),
            opensearchPassword: [...Array()].map(() => crypto.randomInt().toString()).join(''),
            grafanaPassword: [...Array()].map(() => crypto.randomInt().toString()).join(''),
            sentrySecret: crypto.randomBytes().toString('hex'),
            sentryDsn: 'http://localhost:/',
            sentryDbPassword: crypto.randomBytes().toString('base')
        };
        for (const [key, value] of Object.entries(secrets)) {
            fs.writeFileSync(path.join(secretsDir, `${key}.txt`), value);
        }
        this.storeManager.saveSecrets(secrets);
    }
    buildEnvContent(secrets) {
        return ` SpiceGarden Environment Configuration - Auto Generated
 Generated on ${new Date().toISOString()}

 Application
NODE_ENV=development
PORT=
SESSION_DURATION_DAYS=
REFRESH_TOKEN_LENGTH=

 Database - PostgreSQL
DB_HOST=localhost
DB_PORT=
DB_USER=spicegarden
DB_PASS=${secrets.dbPassword}
DB_NAME=spicegarden

 Database - MongoDB
MONGO_URI=mongodb://localhost:/spicegarden

 Database - Redis
REDIS_HOST=localhost
REDIS_PORT=
REDIS_PASSWORD=

 JWT
JWT_SECRET=${secrets.jwtSecret}
JWT_EXPIRES_IN=d
ENCRYPTION_SECRET=${secrets.encryptionSecret}

 Stripe
STRIPE_SECRET_KEY=${secrets.stripeSecretKey}
STRIPE_WEBHOOK_SECRET=${secrets.stripeWebhookSecret}

 Sentry
SENTRY_DSN=${secrets.sentryDsn}

 OpenSearch
OPENSEARCH_URL=http://localhost:

 Monitoring
METRICS_ENABLED=true

 Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@spicegarden.com

 SMS & FCM
TWILIO_ACCOUNT_SID=
TWILIO_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=+
TWILIO_PHONE=+
FCM_SERVER_KEY=
FCM_SENDER_ID=

 Wallet Configuration
WALLET_DEFAULT_CURRENCY=INR
WALLET_NOTIFICATION_THRESHOLD=
WALLET_LOW_BALANCE_THRESHOLD=

 External APIs
GOOGLE_MAPS_API_KEY=
SENDGRID_API_KEY=

 Payment Limits
PAYMENT_MAX_SINGLE_AMOUNT=
PAYMENT_DAILY_LIMIT_PER_USER=

 AlertManager
SLACK_WEBHOOK_URL=
PAGERDUTY_ROUTING_KEY=`;
    }
}
exports.EnvironmentManager = EnvironmentManager;
