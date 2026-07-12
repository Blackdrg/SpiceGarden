import type { DisputeTicket } from './types';
import styles from './SupportTab.module.css';
import { AdminButton } from './AdminButton';
import { DashboardCard } from './DashboardCard';
import { IconReceipt, IconCheck, IconX } from './icons/SGIcon';

export function RefundManagement({
  refunds,
  onApprove,
  onReject,
}: {
  refunds: DisputeTicket[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <DashboardCard title="Refund Management" sub="Recent requests" iconVariant="warning" titleIcon={<IconReceipt size={16} color="#F59E0B" />}>
      {refunds.map((ticket) => (
        <div key={ticket.id} className={styles.refundItem}>
          <div className={styles.refundHeader}>
            <span style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{ticket.id}</span>
            <span className={styles.refundAmount}>-₹{ticket.amount}</span>
          </div>
          <p className={styles.refundDescription}>{ticket.description}</p>
          <div className={styles.refundActions}>
            <button
              type="button"
              className={styles.branchButtonPrimary}
              onClick={() => onApprove(ticket.id)}
              style={{ flex: 1, padding: '6px 0', fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
            >
              <IconCheck size={14} color="white" /> Approve
            </button>
            <button
              type="button"
              className={styles.branchButtonSecondary}
              onClick={() => onReject(ticket.id)}
              style={{ flex: 1, padding: '6px 0', fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
            >
              <IconX size={14} color="#374151" /> Reject
            </button>
          </div>
        </div>
      ))}
      {refunds.length === 0 && <p className={styles.emptyState}>No pending refunds</p>}
    </DashboardCard>
  );
}
