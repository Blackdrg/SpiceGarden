import { Controller, Get } from '@nestjs/common';

@Controller('legal')
export class LegalController {
  @Get('privacy-policy')
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

  @Get('terms-of-service')
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

  @Get('intellectual-property')
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
}