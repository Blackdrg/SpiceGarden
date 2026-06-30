import type { DisputeTicket } from './types';
import { AdminButton } from './AdminButton';
import { DashboardCard } from './DashboardCard';
import { useToast } from '@spicegarden/ui';

export function FraudDetection({ tickets }: { tickets: DisputeTicket[] }) {
  const toast = useToast();

  return (
    <DashboardCard title="🛡️ Fraud Detection" sub="Recent blocks">
      {tickets.map((ticket) => (
        <div key={ticket.id} style={{ padding: '12px', background: '#fff5f5', borderRadius: 8, marginBottom: 8, borderLeft: '4px solid #f04e31' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <strong style={{ color: '#f04e31' }}>🚫 {ticket.id}</strong>
            <span style={{ color: '#999', fontSize: 12 }}>{ticket.createdAt}</span>
          </div>
          <p style={{ margin: '0 0 8px', fontSize: 13 }}>{ticket.description}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <AdminButton label="Investigate" onClick={() => toast.showToast({ message: `Opening case ${ticket.id}`, type: 'info', duration: 0 })} style={{ flex: 1, padding: '6px 0', fontSize: 12 }} />
            <AdminButton label="Block IP" onClick={() => toast.showToast({ message: `IP blocked for ${ticket.id}`, type: 'error', duration: 0 })} variant="secondary" style={{ flex: 1, padding: '6px 0', fontSize: 12 }} />
          </div>
        </div>
      ))}
    </DashboardCard>
  );
}
