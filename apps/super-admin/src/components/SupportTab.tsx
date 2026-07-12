import type { DisputeTicket, Stats } from './types';
import styles from './SupportTab.module.css';
import { KPICard } from './KPICard';
import { FraudDetection } from './FraudDetection';
import { RefundManagement } from './RefundManagement';
import { SupportTicketsPanel } from './SupportTicketsPanel';
import {
  IconAlertCircle,
  IconReceipt,
  IconBan,
  IconClock,
} from './icons/SGIcon';

export function SupportTab({
  stats,
  filteredTickets,
  pendingRefunds,
  fraudTickets,
  ticketFilter,
  onFilterChange,
  onCloseTicket,
  onApproveRefund,
}: {
  stats: Stats;
  filteredTickets: DisputeTicket[];
  pendingRefunds: DisputeTicket[];
  fraudTickets: DisputeTicket[];
  ticketFilter: 'all' | DisputeTicket['type'];
  onFilterChange: (filter: 'all' | DisputeTicket['type']) => void;
  onCloseTicket: (id: string) => void;
  onApproveRefund: (id: string) => void;
}) {
  return (
    <>
      <div className={styles.filterGrid}>
        <KPICard label="Total Tickets" value={String(filteredTickets.length)} upColor="#6B7280" delta="all types" icon={<IconAlertCircle size={20} color="#6B7280" />} />
        <KPICard label="Refunds (today)" value={String(pendingRefunds.length)} upColor="#F59E0B" delta="pending" icon={<IconReceipt size={20} color="#F59E0B" />} />
        <KPICard label="Fraud Blocks" value={String(stats.fraudAlerts)} upColor="#8B5CF6" delta="active" icon={<IconBan size={20} color="#8B5CF6" />} />
        <KPICard label="Avg Resolution" value="4m 12s" upColor="#10B981" delta="target 5m" icon={<IconClock size={20} color="#10B981" />} />
      </div>

      <div className={styles.twoColLayout}>
        <SupportTicketsPanel
          tickets={filteredTickets}
          ticketFilter={ticketFilter}
          onFilterChange={onFilterChange}
          onClose={onCloseTicket}
        />

        <div className={styles.rightCol}>
          <RefundManagement
            refunds={pendingRefunds}
            onApprove={onApproveRefund}
            onReject={onCloseTicket}
          />
          <FraudDetection tickets={fraudTickets} />
        </div>
      </div>
    </>
  );
}
