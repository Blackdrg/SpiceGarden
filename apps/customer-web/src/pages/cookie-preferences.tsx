import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { Button, DESIGN_TOKENS, ToastProvider, useToast } from '@spicegarden/ui';
import { useCookieConsent, CONSENT_VERSION } from '../hooks/useCookieConsent';
import { legalPageContainer, legalTitle, legalMeta, legalSectionHeading } from '../lib/legalStyles';
import styles from './cookie-preferences.module.css';

interface CookieCategory {
  key: 'necessary' | 'functional' | 'preference' | 'performance' | 'analytics' | 'marketing';
  label: string;
  description: string;
  required: boolean;
}

const CATEGORIES: CookieCategory[] = [
  {
    key: 'necessary',
    label: 'Necessary',
    description: 'Required for the website to function properly. Cannot be disabled.',
    required: true,
  },
  {
    key: 'functional',
    label: 'Functional',
    description: 'Enable enhanced functionality and personalization.',
    required: false,
  },
  {
    key: 'preference',
    label: 'Preference',
    description: 'Remember your settings and preferences.',
    required: false,
  },
  {
    key: 'performance',
    label: 'Performance',
    description: 'Help us improve site speed and reliability.',
    required: false,
  },
  {
    key: 'analytics',
    label: 'Analytics',
    description: 'Understand how visitors interact with our services.',
    required: false,
  },
  {
    key: 'marketing',
    label: 'Marketing',
    description: 'Deliver relevant promotions and personalized content.',
    required: false,
  },
];

const CookiePreferencesInner: React.FC = () => {
  const { prefs, saveConsent, withdraw } = useCookieConsent();
  const { showToast } = useToast();
  const [localPrefs, setLocalPrefs] = useState(prefs);
  const [saving, setSaving] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  React.useEffect(() => {
    if (prefs) setLocalPrefs(prefs);
  }, [prefs]);

  const handleToggle = useCallback((key: CookieCategory['key']) => {
    if (key === 'necessary') return;
    setLocalPrefs((prev) => (prev ? { ...prev, [key]: !prev[key] } : prev));
  }, []);

  const handleSave = useCallback(async () => {
    if (!localPrefs) return;
    setSaving(true);
    try {
      await saveConsent(localPrefs);
      showToast({ message: 'Cookie preferences saved successfully.', type: 'success', duration: 4000 });
    } catch {
      showToast({ message: 'Failed to save preferences. Please try again.', type: 'error', duration: 4000 });
    } finally {
      setSaving(false);
    }
  }, [localPrefs, saveConsent, showToast]);

  const handleWithdrawAll = useCallback(async () => {
    setWithdrawing(true);
    try {
      await withdraw();
      showToast({ message: 'All non-essential cookies have been withdrawn.', type: 'success', duration: 4000 });
    } catch {
      showToast({ message: 'Failed to withdraw consent. Please try again.', type: 'error', duration: 4000 });
    } finally {
      setWithdrawing(false);
    }
  }, [withdraw, showToast]);

  return (
    <div style={legalPageContainer}>
      <h1 style={legalTitle}>Cookie Preferences</h1>
      <p style={legalMeta}>
        Manage your cookie consent preferences for this website. Consent version: {CONSENT_VERSION}
      </p>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Cookie Categories</h2>
        <p className={styles.description}>
          Choose which types of cookies you allow. Necessary cookies are always enabled as they are
          essential for the website to function.
        </p>

        <div className={styles.categoryList} role="group" aria-label="Cookie preference categories">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.key}
              className={`${styles.categoryItem} ${cat.required ? styles.categoryItemDisabled : ''}`}
            >
              <div className={styles.categoryInfo}>
                <span className={styles.categoryLabel}>
                  {cat.label}
                  {cat.required && <span className={styles.requiredBadge}>Required</span>}
                </span>
                <span className={styles.categoryDesc}>{cat.description}</span>
              </div>
              <label className={styles.toggleSwitch} aria-label={`${cat.label} cookies`}>
                <input
                  type="checkbox"
                  className={styles.toggleInput}
                  checked={!!localPrefs?.[cat.key]}
                  onChange={() => handleToggle(cat.key)}
                  disabled={cat.required}
                />
                <span className={styles.toggleSlider} />
              </label>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <Button label="Save Preferences" variant="primary" isLoading={saving} onClick={handleSave} />
          <Button label="Withdraw All Non-Essential" variant="secondary" isLoading={withdrawing} onClick={handleWithdrawAll} />
        </div>
      </div>

      <div className={styles.footerNote}>
        For more information about how we use cookies and your personal data, please read our{' '}
        <Link href="/legal/document/privacy_policy">Privacy Policy</Link> and <Link href="/legal/document/terms_of_service">Terms of Service</Link>.
        Your consent is governed by GDPR (EU/UK) and the DPDP Act (India).
        You can update your preferences at any time by returning to this page.
      </div>
    </div>
  );
};

const CookiePreferencesPage: React.FC = () => (
  <ToastProvider>
    <CookiePreferencesInner />
  </ToastProvider>
);

export default CookiePreferencesPage;
