import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { LegalDocumentType } from './entities/legal.enums';
import { LegalDocumentService } from './legal-document.service';
import { RetentionService } from './retention.service';

@Injectable()
export class LegalSeedService implements OnModuleInit {
  private readonly logger = new Logger(LegalSeedService.name);
  private seeded = false;

  constructor(
    private readonly documentService: LegalDocumentService,
    private readonly retentionService: RetentionService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (this.seeded) return;
    this.seeded = true;
    try {
      const docs = await this.seedAll();
      const retention = await this.retentionService.seedDefaults();
      this.logger.log(`Legal seed complete: ${docs.created} documents, ${retention} retention policies`);
    } catch (error) {
      this.logger.error('Legal seed failed', error as Error);
    }
  }

  private section(id: string, title: string, content: string, order: number) {
    return { id, title, content, order };
  }

  async seedAll(approverId = 'system'): Promise<{ created: number; published: number }> {
    const specs = this.documentSpecs();
    const results = await Promise.all(specs.map(async (spec) => {
      const existing = await this.documentService.getDocument(spec.type).catch(() => null);
      if (existing) return { created: false, published: false };
      const doc = await this.documentService.createDocument({
        type: spec.type,
        title: spec.title,
        slug: spec.type,
        ownerRole: 'super_admin',
        requiresAcceptance: spec.requiresAcceptance,
        multiLanguage: true,
      });
      const version = await this.documentService.createVersion(doc.id, {
        title: spec.title,
        sections: spec.sections,
        summary: spec.summary,
        changeNotes: 'Initial production version',
        authorId: approverId,
        effectiveDate: new Date('2026-06-10'),
      });
      await this.documentService.approveVersion(version.id, approverId, 'Initial publication');
      await this.documentService.publishVersion(version.id, approverId);
      return { created: true, published: true };
    }));
    const created = results.filter((r) => r.created).length;
    const published = results.filter((r) => r.published).length;
    return { created, published };
  }

  private documentSpecs(): {
    type: LegalDocumentType;
    title: string;
    summary: string;
    requiresAcceptance: boolean;
    sections: { id: string; title: string; content: string; order: number }[];
  }[] {
    return [
      {
        type: LegalDocumentType.PRIVACY_POLICY,
        title: 'Privacy Policy',
        summary: 'How SpiceGarden collects, uses, shares, and protects personal data across the platform.',
        requiresAcceptance: true,
        sections: [
          this.section('introduction', 'Introduction', 'SpiceGarden ("we", "us", "our") operates a food ordering and delivery platform connecting customers, restaurants, and delivery partners. This Privacy Policy explains how we collect, use, disclose, and safeguard personal information in accordance with the GDPR (EU), CCPA (California), and the Digital Personal Data Protection Act, 2023 (India).', 1),
          this.section('data_we_collect', 'Personal Information We Collect', 'We collect: identity data (name, email, phone, date of birth); profile data (addresses, preferences); location data (GPS during active orders/deliveries); device information (device id, OS, IP); payment information (processed by Stripe/Razorpay — we store tokens only); restaurant data (KYC, bank, menu); driver data (KYC, vehicle, license, GPS).', 2),
          this.section('location_data', 'Location Data', 'We collect precise location only while an order is active or a delivery partner is on shift, with explicit consent. Location history is retained for 30 days for safety and dispute resolution, then deleted.', 3),
          this.section('device_info', 'Device Information', 'Device model, operating system, app version, unique device identifiers, and crash logs are collected to operate and secure the service.', 4),
          this.section('payment_info', 'Payment Information', 'Card numbers are never stored on our servers. Payments are tokenized and processed by PCI-DSS compliant processors (Stripe, Razorpay). We retain payment tokens, transaction IDs, and settlement records for 10 years for tax and legal compliance.', 5),
          this.section('restaurant_data', 'Restaurant Data', 'Restaurant partners provide KYC documents, GST details, bank accounts, menus, and operating data. This is processed under our Merchant Agreement and retained per tax law.', 6),
          this.section('driver_data', 'Driver Data', 'Delivery partners provide identity, vehicle, and license documents, plus real-time GPS during shifts. Processed under the Driver Agreement with consent for location tracking.', 7),
          this.section('analytics', 'Analytics', 'We use aggregated, pseudonymized analytics to improve the platform. Where analytics cookies are enabled, data is processed on the basis of consent.', 8),
          this.section('cookies', 'Cookies and Similar Technologies', 'We use necessary, functional, analytics, performance, marketing, and preference cookies. See our Cookie Policy and manage preferences via the Consent Center.', 9),
          this.section('marketing', 'Marketing and Communications', 'With consent, we send promotional communications. You may opt out at any time via the Privacy Dashboard or unsubscribe links.', 10),
          this.section('push', 'Push Notifications', 'We send transactional and, with consent, promotional push notifications. Notification preferences are manageable per-channel.', 11),
          this.section('third_parties', 'Third-Party Service Providers', 'We share data with: Google Maps (geocoding/routing), Firebase (messaging/analytics), Stripe & Razorpay (payments), Twilio (SMS), email providers (transactional email), and cloud storage providers. Each is bound by data processing agreements.', 12),
          this.section('legal_basis', 'Legal Bases (GDPR)', 'We rely on: contract (to provide the service), legitimate interests (fraud prevention, security), consent (marketing, non-essential cookies, location), and legal obligation (tax, KYC).', 13),
          this.section('international_transfers', 'International Transfers', 'Where data is transferred outside the EEA or India, we use Standard Contractual Clauses, adequacy decisions, or the DPDP Act\'s prescribed mechanisms.', 14),
          this.section('retention', 'Data Retention', 'Users: 7 years after deletion. Orders/invoices: 10 years. Sessions: 90 days. OTP: 24 hours. Driver GPS: 30 days. Audit logs: 3 years. See the Data Retention Policy.', 15),
          this.section('childrens_privacy', "Children's Privacy", 'The platform is not directed to children under 18. We do not knowingly collect data from minors without parental consent.', 16),
          this.section('your_rights', 'Your Rights', 'Depending on your region you may access, correct, delete, restrict, object, port, and withdraw consent. Exercise rights via the Privacy Dashboard or by contacting privacy@spicegarden.com.', 17),
          this.section('dpdp', 'India (DPDP Act, 2023)', 'Indian users are data principals under the DPDP Act. We act as a Data Fiduciary. You may submit grievances to our Grievance Officer and use the Consent Manager.', 18),
          this.section('contact', 'Contact', 'Data Protection Officer: privacy@spicegarden.com. Postal: SpiceGarden Privacy Office, [Registered Address], India.', 19),
        ],
      },
      {
        type: LegalDocumentType.TERMS_OF_SERVICE,
        title: 'Terms of Service',
        summary: 'The agreement governing use of the SpiceGarden platform.',
        requiresAcceptance: true,
        sections: [
          this.section('agreement', 'Agreement', 'By using SpiceGarden you agree to these Terms, the Privacy Policy, and applicable vertical agreements (Merchant, Driver, Partner).', 1),
          this.section('eligibility', 'Eligibility', 'You must be at least 18 years old and provide accurate information.', 2),
          this.section('accounts', 'Accounts', 'You are responsible for safeguarding credentials and for activity under your account.', 3),
          this.section('orders', 'Orders and Payments', 'Prices, fees, and taxes are shown at checkout. Payments are processed by third-party gateways. We are not liable for restaurant preparation or delivery delays caused by force majeure.', 4),
          this.section('refunds', 'Refunds and Cancellations', 'Refunds follow the Refund Policy and Cancellation Policy. Statutory rights are unaffected.', 5),
          this.section('conduct', 'Acceptable Conduct', 'You agree not to misuse the platform, breach security, or infringe rights. Violations may result in suspension.', 6),
          this.section('liability', 'Limitation of Liability', 'To the maximum extent permitted by law, our aggregate liability is limited to the amount paid for the relevant order.', 7),
          this.section('changes', 'Changes', 'We may update these Terms; material changes are notified and require renewed acceptance where required.', 8),
        ],
      },
      {
        type: LegalDocumentType.COOKIE_POLICY,
        title: 'Cookie Policy',
        summary: 'Categories of cookies, purposes, and how to manage them.',
        requiresAcceptance: false,
        sections: [
          this.section('what', 'What Are Cookies', 'Cookies are small text files used to operate, secure, and improve the service.', 1),
          this.section('categories', 'Cookie Categories', 'Necessary (always on), Functional, Performance, Analytics, Marketing, Preference. Non-essential categories require consent.', 2),
          this.section('registry', 'Cookie Registry', 'A current list of cookies is maintained and available via the Consent Center.', 3),
          this.section('manage', 'Managing Cookies', 'You can grant or withdraw consent at any time in the Consent Center or via your browser.', 4),
        ],
      },
      {
        type: LegalDocumentType.REFUND_POLICY,
        title: 'Refund Policy',
        summary: 'Conditions and timelines for refunds.',
        requiresAcceptance: false,
        sections: [
          this.section('eligibility', 'Eligibility', 'Refunds are issued for cancelled orders, non-delivery, or materially deficient items, subject to verification.', 1),
          this.section('timelines', 'Timelines', 'Approved refunds are processed to the original payment method within 5–10 business days.', 2),
          this.section('partial', 'Partial Refunds', 'Where only part of an order is affected, a proportionate refund applies.', 3),
          this.section('wallet', 'Wallet Credits', 'Alternatively, refunds may be issued as wallet credit at the user\'s choice.', 4),
        ],
      },
      {
        type: LegalDocumentType.CANCELLATION_POLICY,
        title: 'Cancellation Policy',
        summary: 'Order cancellation rules for customers, restaurants, and drivers.',
        requiresAcceptance: false,
        sections: [
          this.section('customer', 'Customer Cancellation', 'Customers may cancel before restaurant acceptance for a full refund. Later cancellations may incur fees per the Refund Policy.', 1),
          this.section('restaurant', 'Restaurant Cancellation', 'Restaurants may cancel for operational reasons; repeated cancellations affect rating and may trigger penalties.', 2),
          this.section('driver', 'Driver Cancellation', 'Drivers may cancel per the Driver Agreement; misuse affects incentives and standing.', 3),
        ],
      },
      {
        type: LegalDocumentType.DELIVERY_POLICY,
        title: 'Delivery Policy',
        summary: 'Delivery areas, fees, times, and responsibilities.',
        requiresAcceptance: false,
        sections: [
          this.section('areas', 'Service Areas', 'Delivery is available within mapped coverage areas that may change without notice.', 1),
          this.section('fees', 'Delivery Fees', 'Fees are calculated by distance, demand, and promotional terms shown at checkout.', 2),
          this.section('times', 'Delivery Times', 'Estimated times are not guarantees. Delays from weather or traffic are outside our control.', 3),
          this.section('handoff', 'Handoff', 'Customers should provide accurate drop locations and be available to receive orders.', 4),
        ],
      },
      {
        type: LegalDocumentType.COMMUNITY_GUIDELINES,
        title: 'Community Guidelines',
        summary: 'Standards for respectful conduct across the platform.',
        requiresAcceptance: false,
        sections: [
          this.section('respect', 'Respect', 'Treat customers, restaurants, and delivery partners with respect. Harassment is prohibited.', 1),
          this.section('safety', 'Safety', 'Do not request unsafe conduct or share harmful content.', 2),
          this.section('authenticity', 'Authenticity', 'Provide truthful information in reviews and communications.', 3),
          this.section('enforcement', 'Enforcement', 'Violations may lead to content removal, warnings, or account suspension.', 4),
        ],
      },
      {
        type: LegalDocumentType.MERCHANT_AGREEMENT,
        title: 'Merchant Agreement',
        summary: 'Terms governing restaurant partnership.',
        requiresAcceptance: true,
        sections: [
          this.section('appointment', 'Appointment', 'SpiceGarden appoints the restaurant as a merchant partner to list and sell through the platform.', 1),
          this.section('commission', 'Commission Policy', 'A platform commission is deducted per the agreed rate card. Rates are visible in the merchant dashboard.', 2),
          this.section('settlement', 'Settlement Policy', 'Net payable is settled on a T+[N] cycle to the registered bank account after deductions.', 3),
          this.section('tax', 'Tax (GST)', 'Restaurants are responsible for applicable GST; SpiceGarden facilitates tax computation and invoicing where applicable.', 4),
          this.section('food_safety', 'Food Safety', 'Restaurants must comply with FSSAI licensing and food safety standards.', 5),
          this.section('sla', 'Restaurant SLA', 'Acceptance and preparation SLAs are monitored; breaches affect ranking.', 6),
          this.section('kyc', 'KYC Policy', 'Valid KYC, FSSAI, and bank details are required before onboarding and periodically renewed.', 7),
          this.section('termination', 'Termination', 'Either party may terminate with notice; post-termination settlement and data handling follow this agreement.', 8),
        ],
      },
      {
        type: LegalDocumentType.DRIVER_AGREEMENT,
        title: 'Driver Agreement',
        summary: 'Terms governing delivery partner engagement.',
        requiresAcceptance: true,
        sections: [
          this.section('relationship', 'Independent Contractor', 'Delivery partners are independent contractors, not employees.', 1),
          this.section('insurance', 'Insurance', 'Partners must maintain valid vehicle and third-party insurance.', 2),
          this.section('conduct', 'Code of Conduct', 'Partners must follow safety, hygiene, and conduct standards.', 3),
          this.section('vehicle', 'Vehicle Requirements', 'Vehicles must be roadworthy, registered, and meet local requirements.', 4),
          this.section('verification', 'Background Verification', 'Identity and background checks are conducted before activation.', 5),
          this.section('gps', 'GPS and Location Tracking', 'Partners consent to location tracking during shifts for dispatch, safety, and payout verification.', 6),
          this.section('payment', 'Payment Terms', 'Earnings are calculated per the payout policy and settled on the agreed cycle.', 7),
          this.section('termination', 'Termination', 'Either party may terminate; outstanding dues are settled per this agreement.', 8),
        ],
      },
      {
        type: LegalDocumentType.PARTNER_AGREEMENT,
        title: 'Partner Agreement',
        summary: 'Terms for technology and integration partners.',
        requiresAcceptance: false,
        sections: [
          this.section('scope', 'Scope', 'Governs API, co-marketing, and integration partnerships.', 1),
          this.section('data', 'Data Handling', 'Partners process personal data only on our documented instructions under a DPA.', 2),
          this.section('branding', 'Branding', 'Use of SpiceGarden marks requires prior written approval.', 3),
          this.section('termination', 'Termination', 'Termination triggers return or deletion of shared data.', 4),
        ],
      },
      {
        type: LegalDocumentType.SECURITY_POLICY,
        title: 'Security Policy',
        summary: 'How SpiceGarden protects data and systems.',
        requiresAcceptance: false,
        sections: [
          this.section('overview', 'Overview', 'We maintain defense-in-depth controls across network, application, and data layers.', 1),
          this.section('encryption', 'Encryption', 'Data is encrypted at rest (AES-256-GCM) and in transit (TLS 1.2+).', 2),
          this.section('access', 'Access Control', 'RBAC, least privilege, MFA for administrative access, and just-in-time elevation.', 3),
          this.section('monitoring', 'Monitoring', 'Centralized logging, audit trails, and anomaly detection. See the Security Center.', 4),
        ],
      },
      {
        type: LegalDocumentType.RESPONSIBLE_DISCLOSURE,
        title: 'Responsible Disclosure Policy',
        summary: 'How to report security vulnerabilities.',
        requiresAcceptance: false,
        sections: [
          this.section('reporting', 'Reporting', 'Report vulnerabilities to security@spicegarden.com with PGP encryption. See the Security Center for the key.', 1),
          this.section('embargo', 'Embargo', 'We request a 90-day coordinated disclosure embargo after resolution.', 2),
          this.section('safe_harbor', 'Safe Harbor', 'Good-faith researchers complying with this policy will not face legal action.', 3),
        ],
      },
      {
        type: LegalDocumentType.ACCESSIBILITY_STATEMENT,
        title: 'Accessibility Statement',
        summary: 'Our commitment to WCAG 2.1 AA conformance.',
        requiresAcceptance: false,
        sections: [
          this.section('commitment', 'Commitment', 'We aim to meet WCAG 2.1 AA across web and mobile apps.', 1),
          this.section('measures', 'Measures', 'Semantic markup, keyboard navigation, contrast, and screen-reader testing.', 2),
          this.section('feedback', 'Feedback', 'Accessibility issues can be reported to accessibility@spicegarden.com.', 3),
        ],
      },
      {
        type: LegalDocumentType.DATA_RETENTION_POLICY,
        title: 'Data Retention Policy',
        summary: 'Retention periods and disposal rules for each data category.',
        requiresAcceptance: false,
        sections: [
          this.section('principle', 'Principle', 'We retain personal data only as long as necessary for the purposes collected or as required by law.', 1),
          this.section('schedule', 'Retention Schedule', 'Orders 10y, Invoices 10y, Audit Logs 3y, Sessions 90d, OTP 24h, Driver GPS 30d, Deleted Accounts 7y, Analytics 18m.', 2),
          this.section('disposal', 'Disposal', 'Expired data is archived or permanently deleted via scheduled retention jobs; legal holds suspend deletion.', 3),
        ],
      },
      {
        type: LegalDocumentType.ACCEPTABLE_USE_POLICY,
        title: 'Acceptable Use Policy',
        summary: 'Permitted and prohibited uses of the platform.',
        requiresAcceptance: false,
        sections: [
          this.section('permitted', 'Permitted Use', 'Use the platform lawfully for its intended purpose.', 1),
          this.section('prohibited', 'Prohibited', 'No scraping, reverse engineering, fraud, abuse, or circumvention of controls.', 2),
          this.section('enforcement', 'Enforcement', 'Violations may result in throttling, suspension, or termination and referral to authorities.', 3),
        ],
      },
      {
        type: LegalDocumentType.COPYRIGHT_POLICY,
        title: 'Copyright Policy',
        summary: 'DMCA-style takedown and counter-notice process.',
        requiresAcceptance: false,
        sections: [
          this.section('ownership', 'Ownership', 'SpiceGarden and its licensors retain all intellectual property rights.', 1),
          this.section('dmca', 'Takedown', 'Copyright owners may submit takedown notices to copyright@spicegarden.com with required particulars.', 2),
          this.section('counter', 'Counter-Notice', 'Affected users may submit a counter-notice; we act per applicable law.', 3),
        ],
      },
      {
        type: LegalDocumentType.TRADEMARK_POLICY,
        title: 'Trademark Policy',
        summary: 'Use of SpiceGarden marks.',
        requiresAcceptance: false,
        sections: [
          this.section('rights', 'Rights', 'SpiceGarden names and logos are trademarks. Use requires written permission.', 1),
          this.section('guidelines', 'Guidelines', 'Do not use marks in a way that implies endorsement or modifies the brand.', 2),
        ],
      },
      {
        type: LegalDocumentType.OPEN_SOURCE_LICENSES,
        title: 'Open Source Licenses',
        summary: 'Third-party open-source licenses used by the platform.',
        requiresAcceptance: false,
        sections: [
          this.section('mit', 'MIT Components', 'React, Next.js, NestJS, Express, TypeORM, and many libraries are MIT licensed.', 1),
          this.section('apache', 'Apache-2.0 Components', 'Certain utilities are Apache-2.0 licensed.', 2),
          this.section('attribution', 'Attribution', 'Full license texts and notices are available in the source distribution.', 3),
        ],
      },
    ];
  }
}
