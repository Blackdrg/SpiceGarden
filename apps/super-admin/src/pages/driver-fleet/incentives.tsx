import Link from 'next/link';

export default function DriverFleetIncentives() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Incentives & Bonuses</h1>
      <p style={{ color: '#a1a1aa' }}>Manage driver incentive programs and bonuses.</p>
      <Link href="/driver-fleet" style={{ color: '#f97316', textDecoration: 'none', marginTop: 16, display: 'inline-block' }}>← Back to Fleet</Link>
    </div>
  );
}
