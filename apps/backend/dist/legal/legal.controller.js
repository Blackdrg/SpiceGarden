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
exports.LegalController = void 0;
const common_1 = require("@nestjs/common");
let LegalController = class LegalController {
    getPrivacyPolicy() {
        return {
            title: 'Privacy Policy',
            effectiveDate: '2026-06-10',
            lastUpdated: '2026-06-10',
            sections: [
                {
                    id: 'introduction',
                    title: 'Introduction',
                    content: 'SpiceGarden operates the food delivery platform. This Privacy Policy explains how we collect, use, and protect your personal information.',
                },
                {
                    id: 'information-collected',
                    title: 'Information We Collect',
                    content: 'Personal Information: Name, email, phone, delivery addresses, payment details. Usage Data: Order history, preferences.',
                },
                {
                    id: 'data-retention',
                    title: 'Data Retention',
                    content: 'Users: 7 years after deletion. Orders: 10 years. Sessions: 90 days. Audit Logs: 3 years.',
                },
                {
                    id: 'your-rights',
                    title: 'Your Rights',
                    content: 'Access, correction, deletion, portability, objection rights available.',
                },
                {
                    id: 'security',
                    title: 'Security Measures',
                    content: 'AES-256 encryption, HTTPS, JWT auth, SOC2 compliance framework.',
                },
            ],
            contact: 'privacy@spicegarden.com',
        };
    }
    getTermsOfService() {
        return {
            title: 'Terms of Service',
            effectiveDate: '2026-06-10',
            lastUpdated: '2026-06-10',
            sections: [
                {
                    id: 'agreement',
                    title: 'Agreement to Terms',
                    content: 'By using our services, you agree to these terms and our Privacy Policy.',
                },
                {
                    id: 'eligibility',
                    title: 'Eligibility',
                    content: 'Must be 18+ years old with accurate registration information.',
                },
                {
                    id: 'payments',
                    title: 'Payments',
                    content: 'Prices are final. 5% platform fee. Refunds available for cancellations.',
                },
                {
                    id: 'liability',
                    title: 'Limitation of Liability',
                    content: 'Maximum liability limited to disputed order amount.',
                },
            ],
            contact: 'support@spicegarden.com',
        };
    }
    getIntellectualProperty() {
        return {
            title: 'Intellectual Property',
            copyright: 'Copyright (c) 2026 SpiceGarden',
            license: 'MIT License',
            ownedAssets: [
                'Source Code',
                'Brand Assets (Logo, Trademark)',
                'UI Design System',
                'Documentation',
            ],
            thirdPartyLicenses: [
                { name: 'React', license: 'MIT', compatible: true },
                { name: 'NestJS', license: 'MIT', compatible: true },
                { name: 'Next.js', license: 'MIT', compatible: true },
                { name: 'Express', license: 'MIT', compatible: true },
                { name: 'TypeORM', license: 'MIT', compatible: true },
                { name: 'Mongoose', license: 'MIT', compatible: true },
            ],
        };
    }
};
exports.LegalController = LegalController;
__decorate([
    (0, common_1.Get)('privacy-policy'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LegalController.prototype, "getPrivacyPolicy", null);
__decorate([
    (0, common_1.Get)('terms-of-service'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LegalController.prototype, "getTermsOfService", null);
__decorate([
    (0, common_1.Get)('intellectual-property'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LegalController.prototype, "getIntellectualProperty", null);
exports.LegalController = LegalController = __decorate([
    (0, common_1.Controller)('legal')
], LegalController);
//# sourceMappingURL=legal.controller.js.map