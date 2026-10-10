import Link from 'next/link';
import styles from './shifts.module.css';

export default function DriverFleetShifts() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Shift Management</h1>
      <p className={styles.description}>Schedule and manage driver shifts.</p>
      <Link href="/driver-fleet" className={styles.backLink}>← Back to Fleet</Link>
    </div>
  );
}
