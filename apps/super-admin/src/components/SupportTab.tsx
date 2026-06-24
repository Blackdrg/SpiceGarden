import type { DisputeTicket, Stats } from './types';
import { KPICard } from './KPICard';
import { FraudDetection } from './FraudDetection';
import { RefundManagement } from './RefundManagement';
import { SupportTicketsPanel } from './SupportTicketsPanel';

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <KPICard label="Total Tickets" value={String(filteredTickets.length)} upColor="#888" />
        <KPICard label="Refunds (today)" value={String(pendingRefunds.length)} upColor="#ff9800" />
        <KPICard label="Fraud Blocks" value={String(stats.fraudAlerts)} upColor="#9c27b0" />
        <KPICard label="Avg Resolution" value="4m 12s" upColor="#4caf50" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <SupportTicketsPanel
          tickets={filteredTickets}
          ticketFilter={ticketFilter}
          onFilterChange={onFilterChange}
          onClose={onCloseTicket}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
