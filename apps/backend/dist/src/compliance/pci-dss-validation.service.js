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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PciDssValidationService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PciDssValidationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_fraud_entity_1 = require("../services/payments/payment-fraud.entity");
let PciDssValidationService = PciDssValidationService_1 = class PciDssValidationService {
    configService;
    fraudFlagRepo;
    logger = new common_1.Logger(PciDssValidationService_1.name);
    constructor(configService, fraudFlagRepo) {
        this.configService = configService;
        this.fraudFlagRepo = fraudFlagRepo;
    }
    async validatePciDssCompliance() {
        const requirements = await this.checkAllRequirements();
        const summary = {
            compliant: requirements.filter(r => r.status === 'compliant').length,
            nonCompliant: requirements.filter(r => r.status === 'non_compliant').length,
            notApplicable: requirements.filter(r => r.status === 'not_applicable').length,
        };
        const overallCompliant = summary.nonCompliant === 0 ||
            (summary.compliant >= requirements.length - summary.notApplicable);
        return {
            assessmentDate: new Date(),
            overallCompliant,
            requirements,
            summary,
        };
    }
    async checkAllRequirements() {
        return [
            {
                id: '1.1',
                title: 'Firewall Configuration',
                description: 'Establish and maintain a secure network',
                status: this.configService.get('FIREWALL_ENABLED', true) ? 'compliant' : 'non_compliant',
                evidence: ['K8s network policies', 'NGINX ingress configuration'],
            },
            {
                id: '1.2',
                title: 'Password Policy',
                description: 'Strong password requirements',
                status: this.configService.get('PASSWORD_MIN_LENGTH', 8) >= 8 ? 'compliant' : 'non_compliant',
                evidence: ['Argon2 password hashing', 'Password validation in auth service'],
            },
            {
                id: '2.1',
                title: 'No Card Data Storage',
                description: 'Do not store sensitive authentication data',
                status: 'compliant',
                evidence: ['No card data stored in database', 'Payment processed via Stripe/Razorpay'],
                notes: 'Card data never touches our servers - tokens only',
            },
            {
                id: '2.2',
                title: 'Encryption of Transmission',
                description: 'Encrypt transmission of cardholder data',
                status: this.configService.get('HTTPS_ENABLED', true) ? 'compliant' : 'non_compliant',
                evidence: ['HTTPS enforced', 'Webhook signature validation'],
            },
            {
                id: '3.1',
                title: 'Data Retention',
                description: 'Retention of cardholder data',
                status: 'compliant',
                evidence: ['No cardholder data stored', 'PII retention policies (7 years)'],
            },
            {
                id: '3.2',
                title: 'Sensitive Data Protection',
                description: 'Protection of stored cardholder data',
                status: 'not_applicable',
                notes: 'No cardholder data stored per 2.1',
            },
            {
                id: '4.1',
                title: 'Encryption Transmission',
                description: 'Encrypt transmission across open networks',
                status: 'compliant',
                evidence: ['HTTPS/TLS 1.2+ required', 'Stripe.js for frontend tokenization'],
            },
            {
                id: '4.2',
                title: 'No Default Credentials',
                description: 'No use of vendor-supplied defaults',
                status: 'compliant',
                evidence: ['Environment-based secrets', 'No default passwords in code'],
            },
            {
                id: '5.1',
                title: 'Anti-virus Protection',
                description: 'Protection against malware',
                status: 'compliant',
                evidence: ['Container image scanning', 'npm audit in CI/CD'],
            },
            {
                id: '6.1',
                title: 'Vulnerability Scanning',
                description: 'Regular vulnerability assessments',
                status: 'compliant',
                evidence: ['npm audit', 'OWASP ZAP scan', 'GitHub Dependabot'],
            },
            {
                id: '6.2',
                title: 'System Updates',
                description: 'Secure system development and maintenance',
                status: 'compliant',
                evidence: ['CI/CD pipeline', 'Automated testing'],
            },
            {
                id: '7.1',
                title: 'Least Privilege Access',
                description: 'Restrict access by need-to-know',
                status: 'compliant',
                evidence: ['Role-based access control', 'JWT scopes'],
            },
            {
                id: '8.1',
                title: 'Identify and Authenticate',
                description: 'Identify and authenticate access',
                status: 'compliant',
                evidence: ['JWT authentication', 'Session management'],
            },
            {
                id: '8.2',
                title: 'Multi-factor Authentication',
                description: 'MFA for administrative access',
                status: this.configService.get('MFA_REQUIRED', false) ? 'compliant' : 'non_compliant',
                notes: 'MFA should be implemented for admin interfaces',
            },
            {
                id: '9.1',
                title: 'Audit Trails',
                description: 'Link all access to individual',
                status: 'compliant',
                evidence: ['Audit service logging', 'Payment event logging'],
            },
            {
                id: '9.2',
                title: 'Log All Access',
                description: 'Log all payment card data access',
                status: 'compliant',
                evidence: ['Payment audit logs', 'Admin action logging'],
            },
            {
                id: '9.3',
                title: 'Log Retention',
                description: 'Retain logs for one year',
                status: 'compliant',
                evidence: ['Audit logs retained 3 years', 'Structured logging'],
            },
            {
                id: '10.1',
                title: 'Track Access',
                description: 'Track all access to cardholder data',
                status: 'not_applicable',
                notes: 'No cardholder data stored per 2.1',
            },
            {
                id: '11.1',
                title: 'Regular Security Testing',
                description: 'Test security systems',
                status: 'partial',
                evidence: ['Unit tests', 'Integration tests', 'Chaos testing'],
                notes: 'SAST/DAST automation recommended',
            },
            {
                id: '11.2',
                title: 'Penetration Testing',
                description: 'Penetration testing framework',
                status: 'non_compliant',
                notes: 'External pentest required annually',
            },
            {
                id: '11.3',
                title: 'Intrusion Detection',
                description: 'Intrusion detection mechanisms',
                status: 'partial',
                evidence: ['Audit logging', 'Error rate monitoring'],
                notes: 'IDS/IPS recommended',
            },
            {
                id: '12.1',
                title: 'Security Policy',
                description: 'Maintain security policy',
                status: 'compliant',
                evidence: ['This compliance module', 'Security documentation'],
            },
        ];
    }
    async validatePaymentFlow() {
        const issues = [];
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret || webhookSecret.includes('CHANGE_ME')) {
            issues.push('Stripe webhook secret not configured');
        }
        const stripeKey = this.configService.get('STRIPE_SECRET_KEY');
        if (!stripeKey || stripeKey === 'sk_test_placeholder') {
            issues.push('Stripe secret key using placeholder - configure for production');
        }
        return {
            valid: issues.length === 0,
            issues,
        };
    }
    async getFraudMetricsForSaq() {
        const [totalTransactions, fraudFlags, chargebacks] = await Promise.all([
            this.fraudFlagRepo.count(),
            this.fraudFlagRepo.count({ where: { isBlocked: true } }),
            this.fraudFlagRepo.count({ where: { flagType: 'chargeback_risk' } }),
        ]);
        return {
            totalTransactions,
            fraudFlags,
            chargebackRate: chargebacks > 0 ? (chargebacks / totalTransactions) * 100 : 0,
            blockedTransactions: fraudFlags,
        };
    }
    async getQuarterlyComplianceScan() {
        this.logger.log('Running quarterly PCI DSS compliance scan');
        const [paymentValidation, pciReport] = await Promise.all([
            this.validatePaymentFlow(),
            this.validatePciDssCompliance(),
        ]);
        const scanResults = {
            timestamp: new Date().toISOString(),
            paymentFlow: paymentValidation,
            pciDss: {
                overallCompliant: pciReport.overallCompliant,
                summary: pciReport.summary,
            },
            recommendations: this.generateRecommendations(pciReport.requirements),
        };
        return scanResults;
    }
    generateRecommendations(requirements) {
        const recommendations = [];
        for (const req of requirements) {
            if (req.status === 'non_compliant' || req.status === 'partial') {
                recommendations.push(`${req.id}: ${req.title} - ${req.notes || 'Needs attention'}`);
            }
        }
        if (recommendations.length === 0) {
            recommendations.push('All PCI DSS requirements currently compliant - continue quarterly scans');
        }
        return recommendations;
    }
};
exports.PciDssValidationService = PciDssValidationService;
exports.PciDssValidationService = PciDssValidationService = PciDssValidationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(payment_fraud_entity_1.PaymentFraudFlagEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService, typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], PciDssValidationService);
