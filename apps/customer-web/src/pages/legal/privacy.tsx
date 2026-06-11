import React from 'react';
import { DESIGN_TOKENS } from '@spicegarden/ui';

const containerStyle: React.CSSProperties = {
  padding: DESIGN_TOKENS.spacing.md,
  fontFamily: DESIGN_TOKENS.typography.fontFamily,
  backgroundColor: DESIGN_TOKENS.colors.background,
  minHeight: '100vh',
};

const headingStyle: React.CSSProperties = {
  ...DESIGN_TOKENS.typography.headingS,
  color: DESIGN_TOKENS.colors.textPrimary,
  marginBottom: DESIGN_TOKENS.spacing.sm,
};

const subheadingStyle: React.CSSProperties = {
  ...DESIGN_TOKENS.typography.body,
  color: DESIGN_TOKENS.colors.textSecondary,
  marginTop: DESIGN_TOKENS.spacing.lg,
  marginBottom: DESIGN_TOKENS.spacing.xs,
};

const PrivacyPolicyPage = () => {

  return (
    <div style={containerStyle}>
      <h1 style={{ ...DESIGN_TOKENS.typography.headingL, color: DESIGN_TOKENS.colors.textPrimary, marginBottom: DESIGN_TOKENS.spacing.md }}>
        Privacy Policy
      </h1>

      <p style={{ color: DESIGN_TOKENS.colors.textSecondary, fontSize: '14px' }}>
        <strong>Effective Date:</strong> June 10, 2026 | <strong>Last Updated:</strong> June 10, 2026
      </p>

      <h2 style={headingStyle}>1. Introduction</h2>
      <p style={subheadingStyle}>
        SpiceGarden ("we", "us", or "our") operates the SpiceGarden food delivery platform. This Privacy Policy explains how we collect, use, and protect your personal information.
      </p>

      <h2 style={headingStyle}>2. Information We Collect</h2>
      <h3 style={{ ...DESIGN_TOKENS.typography.body, color: DESIGN_TOKENS.colors.textPrimary, marginTop: DESIGN_TOKENS.spacing.sm }}>Personal Information</h3>
      <ul style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
        <li>Account Data: Name, email, phone number, delivery addresses</li>
        <li>Payment Data: Processed securely by Stripe/Razorpay</li>
        <li>Device Information: Device type, IP address, browser information</li>
        <li>Location Data: Delivery addresses, GPS coordinates (when permitted)</li>
      </ul>

      <h2 style={headingStyle}>3. How We Use Your Information</h2>
      <ul style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
        <li>Service Provision: Process orders, payments, and deliveries</li>
        <li>Communication: Send order updates, promotional offers (opt-out available)</li>
        <li>Security: Detect fraud, prevent unauthorized access</li>
        <li>Legal Compliance: Retain data as required by law (7 years minimum)</li>
      </ul>

      <h2 style={headingStyle}>4. Data Retention</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: DESIGN_TOKENS.spacing.sm }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${DESIGN_TOKENS.colors.border}` }}>
            <th style={{ textAlign: 'left', padding: DESIGN_TOKENS.spacing.xs }}>Data Type</th>
            <th style={{ textAlign: 'left', padding: DESIGN_TOKENS.spacing.xs }}>Retention Period</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={{ padding: DESIGN_TOKENS.spacing.xs }}>User Accounts</td><td style={{ padding: DESIGN_TOKENS.spacing.xs }}>7 years after deletion</td></tr>
          <tr><td style={{ padding: DESIGN_TOKENS.spacing.xs }}>Orders</td><td style={{ padding: DESIGN_TOKENS.spacing.xs }}>10 years</td></tr>
          <tr><td style={{ padding: DESIGN_TOKENS.spacing.xs }}>Sessions</td><td style={{ padding: DESIGN_TOKENS.spacing.xs }}>90 days</td></tr>
          <tr><td style={{ padding: DESIGN_TOKENS.spacing.xs }}>Audit Logs</td><td style={{ padding: DESIGN_TOKENS.spacing.xs }}>3 years</td></tr>
        </tbody>
      </table>

      <h2 style={headingStyle}>5. Your Rights</h2>
      <ul style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
        <li>Access: Request copy of your personal data</li>
        <li>Correction: Update your information in-app</li>
        <li>Deletion: Request account deletion via support</li>
        <li>Portability: Export your data upon request</li>
        <li>Objection: Opt out of marketing communications</li>
      </ul>

      <h2 style={headingStyle}>6. Security Measures</h2>
      <ul style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
        <li>AES-256 encryption for PII at rest</li>
        <li>HTTPS encryption in transit</li>
        <li>JWT-based authentication</li>
        <li>SOC2 compliance framework</li>
      </ul>

      <h2 style={headingStyle}>7. Contact</h2>
      <p style={{ color: DESIGN_TOKENS.colors.primary }}>privacy@spicegarden.com</p>
    </div>
  );
};

export default PrivacyPolicyPage;