import type { DisputeTicket } from './types';
import { AdminButton } from './AdminButton';
import { DashboardCard } from './DashboardCard';
import { useToast } from '@spicegarden/ui';
import { IconShield, IconBan, IconSearch } from './icons/SGIcon';
import styles from './SupportTab.module.css';

export function FraudDetection({ tickets }: { tickets: DisputeTicket[] }) {
  const toast = useToast();

  return (
    <DashboardCard title="Fraud Detection" sub="Recent blocks" iconVariant="danger" titleIcon={<IconShield size={16} color="#EF4444" />}>
      {tickets.map((ticket) => (
        <div key={ticket.id} className={styles.fraudItem}>
          <div className={styles.fraudHeader}>
            <strong className={styles.fraudId}>
              <IconBan size={14} color="#EF4444" />
              {ticket.id}
            </strong>
            <span className={styles.fraudTime}>{ticket.createdAt}</span>
          </div>
          <p className={styles.fraudDescription}>{ticket.description}</p>
          <div className={styles.fraudActions}>
            <button
              type="button"
              className={styles.branchButtonPrimary}
              onClick={() => toast.showToast({ message: `Opening case ${ticket.id}`, type: 'info', duration: 0 })}
              style={{ flex: 1, padding: '6px 0', fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
            >
              <IconSearch size={14} color="white" /> Investigate
            </button>
            <button
              type="button"
              className={styles.branchButtonSecondary}
              onClick={() => toast.showToast({ message: `IP blocked for ${ticket.id}`, type: 'error', duration: 0 })}
              style={{ flex: 1, padding: '6px 0', fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
            >
              <IconBan size={14} color="#374151" /> Block IP
            </button>
          </div>
        </div>
      ))}
      {tickets.length === 0 && <p className={styles.emptyState}>No fraud alerts</p>}
    </DashboardCard>
  );
}
