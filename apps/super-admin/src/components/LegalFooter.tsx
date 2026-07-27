import Link from 'next/link';

type LegalLink = { label: string; href: string };

const LEGAL_LINKS: LegalLink[] = [
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'Terms of Service', href: '/legal/terms' },
  { label: 'Cookie Policy', href: '/legal/cookies' },
  { label: 'Security Center', href: '/security' },
  { label: 'Accessibility Statement', href: '/legal/accessibility' },
];

export function LegalFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        borderTop: '1px solid #1e293b',
        background: '#020617',
        color: '#94a3b8',
        padding: '20px 24px',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px 20px',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: 960,
          margin: '0 auto',
        }}
      >
        {LEGAL_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              color: '#cbd5e1',
              fontSize: 13,
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div
        style={{
          textAlign: 'center',
          fontSize: 12,
          color: '#64748b',
          marginTop: 12,
        }}
      >
        © {year} SpiceGarden. All rights reserved.
      </div>
    </footer>
  );
}
