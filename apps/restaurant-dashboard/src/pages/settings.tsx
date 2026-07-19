import React from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Card, Button, DESIGN_TOKENS } from '@spicegarden/ui';

const API = (path: string) => `/api/business/${path}`;

const fetchProfile = async () => {
  const res = await fetch(API('profile'));
  if (!res.ok) return null;
  const data = await res.json();
  return (data && data.profile) ? data.profile : null;
};

const sectionHeading: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  margin: '0 0 12px',
  color: DESIGN_TOKENS.colors.textPrimary,
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  color: DESIGN_TOKENS.colors.textSecondary,
  marginBottom: 4,
  fontWeight: 500,
};

const valueStyle: React.CSSProperties = {
  fontSize: 14,
  color: DESIGN_TOKENS.colors.textPrimary,
  marginBottom: 12,
};

const SettingsPage: React.FC = () => {
  const router = useRouter();
  const { data: profile, isLoading: loading } = useQuery({
    queryKey: ['business-profile'],
    queryFn: fetchProfile,
    retry: 1,
  });

  return (
    <div style={{ minHeight: '100vh', background: DESIGN_TOKENS.colors.background, color: DESIGN_TOKENS.colors.textPrimary, padding: 24, fontFamily: DESIGN_TOKENS.typography.fontFamily }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px' }}>Settings</h1>
      <p style={{ color: DESIGN_TOKENS.colors.textSecondary, marginTop: 0, marginBottom: 20, fontSize: 14 }}>
        Manage your restaurant profile, preferences, and compliance settings.
      </p>

      {loading ? (
        <p style={{ color: DESIGN_TOKENS.colors.textSecondary }}>Loading…</p>
      ) : (
        <>
          <Card variant="elevated" style={{ marginBottom: 20, padding: 20 }}>
            <h2 style={sectionHeading}>Profile</h2>
            <div style={labelStyle as React.CSSProperties}>Restaurant Name</div>
            <div style={valueStyle}>{profile.name || '—'}</div>
            <div style={labelStyle as React.CSSProperties}>Email</div>
            <div style={valueStyle}>{profile.email || '—'}</div>
            <div style={labelStyle as React.CSSProperties}>Phone</div>
            <div style={valueStyle}>{profile.phone || '—'}</div>
            <Button label="Edit Profile" variant="secondary" onClick={() => router.push('/onboarding/business')} />
          </Card>

          <Card variant="elevated" style={{ marginBottom: 20, padding: 20 }}>
            <h2 style={sectionHeading}>Privacy &amp; Legal</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Button label="Legal Center" variant="secondary" onClick={() => router.push('/legal')} />
              <Button label="Merchant Agreement" variant="secondary" onClick={() => router.push('/merchant-legal')} />
              <Button label="Cookie Policy" variant="secondary" onClick={() => router.push('/legal/document/cookie_policy')} />
              <Button label="Data Retention Policy" variant="secondary" onClick={() => router.push('/legal/document/data_retention_policy')} />
              <Button label="Privacy Policy" variant="secondary" onClick={() => router.push('/legal/document/privacy_policy')} />
            </div>
          </Card>

          <Card variant="elevated" style={{ marginBottom: 20, padding: 20 }}>
            <h2 style={sectionHeading}>Security</h2>
            <p style={{ color: DESIGN_TOKENS.colors.textSecondary, fontSize: 14, margin: '0 0 12px' }}>
              Manage your account security settings and review login activity.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Button label="Security Center" variant="secondary" onClick={() => router.push('/security')} />
              <Button label="Change Password" variant="secondary" onClick={() => router.push('/security')} />
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default SettingsPage;
