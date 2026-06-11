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

const TermsOfServicePage = () => {
  return (
    <div style={containerStyle}>
      <h1 style={{ ...DESIGN_TOKENS.typography.headingL, color: DESIGN_TOKENS.colors.textPrimary, marginBottom: DESIGN_TOKENS.spacing.md }}>
        Terms of Service
      </h1>

      <p style={{ color: DESIGN_TOKENS.colors.textSecondary, fontSize: '14px' }}>
        <strong>Effective Date:</strong> June 10, 2026 | <strong>Last Updated:</strong> June 10, 2026
      </p>

      <h2 style={headingStyle}>1. Agreement to Terms</h2>
      <p style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
        By using our services, you agree to be bound by these Terms of Service and our Privacy Policy.
      </p>

      <h2 style={headingStyle}>2. Eligibility</h2>
      <ul style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
        <li>Must be 18+ years old</li>
        <li>Must provide accurate registration information</li>
        <li>Responsible for maintaining account security</li>
      </ul>

      <h2 style={headingStyle}>3. Payments & Pricing</h2>
      <ul style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
        <li>Prices are final and displayed before order confirmation</li>
        <li>5% platform commission on orders</li>
        <li>Payment methods: Stripe, Razorpay, Cash on Delivery</li>
        <li>Refunds available for cancelled orders before preparation</li>
      </ul>

      <h2 style={headingStyle}>4. Order Cancellation</h2>
      <p style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
        Customers may cancel before restaurant acceptance. Full refunds processed automatically.
      </p>

      <h2 style={headingStyle}>5. Delivery Terms</h2>
      <ul style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
        <li>Estimated delivery times are not guarantees</li>
        <li>Delivery personnel are independent contractors</li>
        <li>Contact-free delivery available upon request</li>
      </ul>

      <h2 style={headingStyle}>6. Intellectual Property</h2>
      <p style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
        SpiceGarden name and logo are trademarks. All content is copyrighted.
      </p>

      <h2 style={headingStyle}>7. Limitation of Liability</h2>
      <p style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
        Maximum liability limited to disputed order amount. We do not guarantee uninterrupted service.
      </p>

      <h2 style={headingStyle}>8. Governing Law</h2>
      <p style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
        These terms are governed by the laws of India.
      </p>

      <h2 style={headingStyle}>9. Contact</h2>
      <p style={{ color: DESIGN_TOKENS.colors.primary }}>support@spicegarden.com</p>
    </div>
  );
};

export default TermsOfServicePage;