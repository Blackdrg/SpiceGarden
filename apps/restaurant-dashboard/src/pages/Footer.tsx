import React from 'react';
import Link from 'next/link';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import styles from './Footer.module.css';

const LEGAL_LINKS: { href: string; label: string }[] = [
  { href: '/legal', label: 'Legal Center' },
  { href: '/legal/document/privacy_policy', label: 'Privacy Policy' },
  { href: '/legal/document/terms_of_service', label: 'Terms of Service' },
  { href: '/legal/document/cookie_policy', label: 'Cookie Policy' },
  { href: '/legal/document/refund_policy', label: 'Refund Policy' },
  { href: '/security', label: 'Security Center' },
];

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer} aria-label="Legal and compliance links">
      <nav className={styles.links} aria-label="Legal documents">
        {LEGAL_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={styles.link}>
            {link.label}
          </Link>
        ))}
      </nav>
      <p className={styles.copy}>
        &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> SpiceGarden. All rights reserved. SpiceGarden is a registered data
        fiduciary under the DPDP Act 2023.
      </p>
    </footer>
  );
};

export default Footer;
