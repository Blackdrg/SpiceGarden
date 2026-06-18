import type { DisputeTicket } from './types';
import { AdminButton } from './AdminButton';
import { DashboardCard } from './DashboardCard';

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
    <DashboardCard title="💸 Refund Management" sub="Recent requests">
      {refunds.map((ticket) => (
        <div key={ticket.id} style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{ticket.id}</span>
            <span style={{ fontWeight: 'bold', color: '#ff4444' }}>-₹{ticket.amount}</span>
          </div>
          <p style={{ color: '#666', fontSize: 12, margin: '0 0 8px' }}>{ticket.description}</p>
          <div style={{ display: 'flex', gap: 6 }}>
            <AdminButton label="Approve" onClick={() => onApprove(ticket.id)} style={{ flex: 1, padding: '6px 0', fontSize: 12 }} />
            <AdminButton label="Reject" onClick={() => onReject(ticket.id)} variant="secondary" style={{ flex: 1, padding: '6px 0', fontSize: 12 }} />
          </div>
        </div>
      ))}
      {refunds.length === 0 && <p style={{ color: '#aaa', textAlign: 'center', padding: 20 }}>No pending refunds</p>}
    </DashboardCard>
  );
}
