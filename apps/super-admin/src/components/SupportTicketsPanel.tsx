import type { DisputeTicket } from './types';
import styles from './SupportTab.module.css';
import { AdminButton } from './AdminButton';
import { DashboardCard } from './DashboardCard';
import {
  IconFileText,
  IconSearch,
  IconX,
  IconReceipt,
  IconCheck,
} from './icons/SGIcon';

const SEVERITY_CLASS_MAP: Record<DisputeTicket['severity'], string> = {
  low: styles.severityLow,
  medium: styles.severityMedium,
  high: styles.severityHigh,
  critical: styles.severityCritical,
};

const TICKET_ICON_MAP: Record<DisputeTicket['type'], { emoji: React.ReactNode; className: string }> = {
  refund: { emoji: <IconReceipt size={14} color="#D97706" />, className: styles.ticketIconRefund },
  support: { emoji: <IconSearch size={14} color="#2563EB" />, className: styles.ticketIconSupport },
  fraud: { emoji: <IconFileText size={14} color="#DC2626" />, className: styles.ticketIconFraud },
};

export function SupportTicketsPanel({
  tickets,
  ticketFilter,
  onFilterChange,
  onClose,
}: {
  tickets: DisputeTicket[];
  ticketFilter: 'all' | DisputeTicket['type'];
  onFilterChange: (filter: 'all' | DisputeTicket['type']) => void;
  onClose: (id: string) => void;
}) {
  return (
    <DashboardCard
      title={`Support Tickets — ${tickets.length} items`}
      sub="sorted by urgency"
      iconVariant="info"
      titleIcon={<IconFileText size={16} color="#3B82F6" />}
    >
      <div className={styles.filterRow}>
        {(['all', 'refund', 'support', 'fraud'] as const).map((filter) => {
          const isActive = ticketFilter === filter;
          const iconInfo = filter !== 'all' ? TICKET_ICON_MAP[filter] : null;
          return (
            <button
              key={filter}
              type="button"
              className={`${styles.filterButton} ${isActive ? styles.filterButtonActive : ''}`}
              onClick={() => onFilterChange(filter)}
            >
              {iconInfo && <span className={iconInfo.className} style={{ display: 'inline-flex', alignItems: 'center' }}>{iconInfo.emoji}</span>}
              {filter === 'all' ? 'All' : `${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
            </button>
          );
        })}
      </div>
      <div className={styles.ticketScroll}>
        {tickets.map((ticket) => {
          const iconInfo = TICKET_ICON_MAP[ticket.type];
          return (
            <div key={ticket.id} className={styles.ticketItem}>
              <div className={styles.ticketHeader}>
                <div className={styles.ticketLeft}>
                  <span className={`${styles.ticketIcon} ${iconInfo.className}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    {iconInfo.emoji}
                  </span>
                  <span className={styles.ticketId}>{ticket.id}</span>
                  <span className={`${styles.severityBadge} ${SEVERITY_CLASS_MAP[ticket.severity]}`}>
                    {ticket.severity.toUpperCase()}
                  </span>
                </div>
                <span className={styles.ticketTime}>{ticket.createdAt}</span>
              </div>
              <p className={styles.ticketDescription}>{ticket.description}</p>
              <div className={styles.ticketFooter}>
                <span className={styles.ticketReporter}>
                  Reported by: {ticket.user} {ticket.amount ? `· ₹${ticket.amount}` : ''}
                </span>
                <div className={styles.ticketActions}>
                  <AdminButton
                    label={ticket.type === 'refund' ? 'Refund' : 'Reply'}
                    onClick={() => null}
                    style={{ padding: '4px 12px', fontSize: 12 }}
                  />
                  <AdminButton
                    label="Close"
                    onClick={() => onClose(ticket.id)}
                    variant="secondary"
                    style={{ padding: '4px 12px', fontSize: 12 }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}
