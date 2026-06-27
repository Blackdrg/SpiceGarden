import { useState } from 'react';
import { Button } from '@spicegarden/ui';
import Head from 'next/head';
import styles from './payout.module.css';

export default function OnboardingPayout() {
  const [form, setForm] = useState({
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
  });
  const [loading, setLoading] = useState(false);
  const RESTAURANT_ID = 'demo-restaurant';

  const submit = async () => {
    if (form.accountNumber !== form.confirmAccountNumber) {
      alert('Account numbers do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/restaurant-onboarding/payout/${RESTAURANT_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountHolderName: form.accountHolderName,
          accountNumber: form.accountNumber,
          ifscCode: form.ifscCode,
          bankName: form.bankName,
          branchName: form.branchName,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      alert('Payout settings saved. Onboarding complete!');
    } catch (e) {
      alert('Failed to save payout details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head><title>Payout Settings - Onboarding</title></Head>
      <div className={styles.maxWidth}>
        <h1 className={styles.heading}>Payout Settings</h1>
        <p className={styles.subtitle}>Add your bank details to receive payouts.</p>

        <div className={styles.infoBox}>
          <p className={styles.infoText}>Your payouts will be sent to this account on a weekly basis.</p>
        </div>

        <div className={styles.formGroup}>
          <div>
            <label htmlFor="payout-holder" className={styles.label}>Account Holder Name</label>
            <input
              id="payout-holder"
              aria-label="Account Holder Name"
              value={form.accountHolderName}
              onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })}
              placeholder="As per bank records"
              className={styles.input}
            />
          </div>
          <div>
            <label htmlFor="payout-acct-num" className={styles.label}>Account Number</label>
            <input
              id="payout-acct-num"
              aria-label="Account Number"
              value={form.accountNumber}
              onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
              placeholder="Enter account number"
              type="password"
              className={styles.input}
            />
          </div>
          <div>
            <label htmlFor="payout-confirm-acct" className={styles.label}>Confirm Account Number</label>
            <input
              id="payout-confirm-acct"
              aria-label="Confirm Account Number"
              value={form.confirmAccountNumber}
              onChange={(e) => setForm({ ...form, confirmAccountNumber: e.target.value })}
              placeholder="Re-enter account number"
              type="password"
              className={styles.input}
            />
          </div>
          <div>
            <label htmlFor="payout-ifsc" className={styles.label}>IFSC Code</label>
            <input
              id="payout-ifsc"
              aria-label="IFSC Code"
              value={form.ifscCode}
              onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
              placeholder="SBIN0001234"
              maxLength={11}
              className={styles.input}
            />
          </div>
          <div>
            <label htmlFor="payout-bank" className={styles.label}>Bank Name</label>
            <input
              id="payout-bank"
              aria-label="Bank Name"
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              placeholder="State Bank of India"
              className={styles.input}
            />
          </div>
          <div>
            <label htmlFor="payout-branch" className={styles.label}>Branch Name</label>
            <input
              id="payout-branch"
              aria-label="Branch Name"
              value={form.branchName}
              onChange={(e) => setForm({ ...form, branchName: e.target.value })}
              placeholder="Main Branch"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => window.location.href = '/onboarding/menu'}
            className={styles.backButton}
          >
            Back
          </button>
          <Button
            label={loading ? 'Submitting...' : 'Complete Onboarding'}
            onClick={submit}
            disabled={loading}
            className={styles.primaryButton}
          />
        </div>
      </div>
    </div>
  );
}
