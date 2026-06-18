import type { DisputeTicket } from './types';
import { AdminButton } from './AdminButton';
import { DashboardCard } from './DashboardCard';

const SEVERITY_COLORS: Record<DisputeTicket['severity'], string> = {
  low: '#2196f3',
  medium: '#ff9800',
  high: '#ff4444',
  critical: '#9c27b0',
};

const TICKET_TYPE_ICONS: Record<DisputeTicket['type'], string> = {
  refund: '💸',
  support: '🎧',
  fraud: '🛡️',
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
    <DashboardCard title={`🧾 Support Tickets — ${tickets.length} items`} sub="sorted by urgency">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['all', 'refund', 'support', 'fraud'] as const).map((filter) => (
          <AdminButton
            key={filter}
            label={filter === 'all' ? 'All' : `${TICKET_TYPE_ICONS[filter]} ${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
            onClick={() => onFilterChange(filter)}
            variant={ticketFilter === filter ? 'primary' : 'secondary'}
            style={{ padding: '4px 12px', fontSize: 12 }}
          />
        ))}
      </div>
      <div style={{ maxHeight: 480, overflowY: 'auto' }}>
        {tickets.map((ticket) => (
          <div key={ticket.id} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 16 }}>{TICKET_TYPE_ICONS[ticket.type]}</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{ticket.id}</span>
                <span style={{ padding: '2px 8px', borderRadius: 8, fontSize: 12, fontWeight: 'bold', background: `${SEVERITY_COLORS[ticket.severity]}22`, color: SEVERITY_COLORS[ticket.severity] }}>
                  {ticket.severity.toUpperCase()}
                </span>
              </div>
              <span style={{ fontSize: 12, color: '#aaa' }}>{ticket.createdAt}</span>
            </div>
            <p style={{ margin: '2px 0 4px', color: '#555', fontSize: 13 }}>{ticket.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#888' }}>Reported by: {ticket.user} {ticket.amount ? `· ₹${ticket.amount}` : ''}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <AdminButton label={ticket.type === 'refund' ? 'Refund' : 'Reply'} onClick={() => null} style={{ padding: '4px 10px', fontSize: 12 }} />
                <AdminButton label="Close" onClick={() => onClose(ticket.id)} variant="secondary" style={{ padding: '4px 10px', fontSize: 12 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
