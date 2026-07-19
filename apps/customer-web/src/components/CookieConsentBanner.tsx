import React, { useState } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { useCookieConsent, ConsentPreferences, DEFAULT_CONSENT } from '../hooks/useCookieConsent';
import styles from './CookieConsentBanner.module.css';

interface CookieConsentBannerProps {
  userId?: string;
}

const CATEGORIES: { key: keyof ConsentPreferences; label: string; description: string; locked?: boolean }[] = [
  { key: 'necessary', label: 'Strictly Necessary', description: 'Required for core functionality such as authentication, security, and cart. Cannot be disabled.', locked: true },
  { key: 'functional', label: 'Functional', description: 'Remembers your preferences like language and location.' },
  { key: 'preference', label: 'Preferences', description: 'Stores UI and personalization choices.' },
  { key: 'performance', label: 'Performance', description: 'Measures site performance and reliability.' },
  { key: 'analytics', label: 'Analytics', description: 'Helps us understand how the platform is used.' },
  { key: 'marketing', label: 'Marketing', description: 'Used to deliver relevant offers and measure campaigns.' },
];

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ userId }) => {
  const { bannerVisible, prefs, region, saveConsent, setBannerVisible } = useCookieConsent();
  const [showDetails, setShowDetails] = useState(false);
  const [draft, setDraft] = useState<ConsentPreferences>(prefs || DEFAULT_CONSENT);

  if (!bannerVisible || !prefs) return null;

  const regionLabel =
    region === 'eu' ? 'We use cookies as required under the EU GDPR.' :
    region === 'in' ? 'We use cookies as required under the DPDP Act, 2023 (India).' :
    'We use cookies to improve your experience.';

  const acceptAll = () => {
    const all: ConsentPreferences = { necessary: true, functional: true, preference: true, performance: true, analytics: true, marketing: true };
    void saveConsent(all, userId);
  };

  const rejectNonEssential = () => {
    void saveConsent({ ...DEFAULT_CONSENT }, userId);
  };

  const saveSelected = () => {
    void saveConsent(draft, userId);
  };

  const toggle = (key: keyof ConsentPreferences) => {
    if (key === 'necessary') return;
    setDraft((d) => ({ ...d, [key]: !d[key] }));
  };

  return (
    <div className={styles.overlay} role="region" aria-label="Cookie consent">
      <Card variant="elevated" className={styles.card}>
        <h2 className={styles.title}>Your Privacy Choices</h2>
        <p className={styles.body}>
          {regionLabel} You can accept all, reject non-essential, or manage categories below. Consent can be withdrawn at any time from your Privacy Dashboard.
        </p>

        {showDetails && (
          <div className={styles.categories}>
            {CATEGORIES.map((c) => (
              <label key={String(c.key)} className={styles.category}>
                <input
                  type="checkbox"
                  checked={c.locked ? true : draft[c.key]}
                  disabled={c.locked}
                  onChange={() => toggle(c.key)}
                  aria-label={c.label}
                />
                <span>
                  <strong>{c.label}</strong>
                  <span className={styles.desc}>{c.description}</span>
                </span>
              </label>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          {!showDetails ? (
            <>
              <Button label="Manage Preferences" variant="outline" onClick={() => { setDraft(prefs); setShowDetails(true); }} />
              <Button label="Reject Non-Essential" variant="secondary" onClick={rejectNonEssential} />
              <Button label="Accept All" variant="primary" onClick={acceptAll} />
            </>
          ) : (
            <>
              <Button label="Collapse" variant="outline" onClick={() => setShowDetails(false)} />
              <Button label="Save Selection" variant="primary" onClick={saveSelected} />
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CookieConsentBanner;
