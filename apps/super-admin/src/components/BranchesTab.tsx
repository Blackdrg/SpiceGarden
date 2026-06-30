import type { BranchStatus } from './types';
import { AdminButton } from './AdminButton';
import { DashboardCard } from './DashboardCard';
import { useToast } from '@spicegarden/ui';

const BRANCH_STATUS_COLORS: Record<BranchStatus['status'], string> = {
  operational: '#4caf50',
  delayed: '#ff4444',
  critical: '#9c27b0',
};

export function BranchesTab({ branches }: { branches: BranchStatus[] }) {
  const toast = useToast();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
      {branches.map((branch) => (
        <DashboardCard key={branch.name} title={branch.name} sub={`${branch.orderCount} orders · ${branch.driversAssigned} drivers`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{
              padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 'bold',
              background: `${BRANCH_STATUS_COLORS[branch.status]}22`,
              color: BRANCH_STATUS_COLORS[branch.status],
              border: `1px solid ${BRANCH_STATUS_COLORS[branch.status]}66`,
            }}>
              {branch.status.toUpperCase()}
            </span>
            <span style={{ color: '#666', fontSize: 13 }}>
              Avg prep: <strong style={{ color: branch.avgPrepMins > 20 ? '#ff4444' : '#4caf50' }}>{branch.avgPrepMins}m</strong>
            </span>
          </div>

          <ProgressBar
            label="Prep time"
            detail={`${branch.avgPrepMins} / 18 min target`}
            ratio={Math.min(100, (branch.avgPrepMins / 18) * 100)}
            color={branch.avgPrepMins > 20 ? '#ff4444' : '#4caf50'}
          />

          <ProgressBar
            label="Driver coverage"
            detail={`${branch.driversAssigned} drivers / ${branch.orderCount} orders`}
            ratio={branch.orderCount === 0 ? 100 : Math.min(100, (branch.driversAssigned / branch.orderCount) * 100)}
            color={branch.driversAssigned < branch.orderCount * 0.3 ? '#ff9800' : '#2196f3'}
          />

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <AdminButton label="View KDS" onClick={() => toast.showToast({ message: `Opening KDS for ${branch.name}`, type: 'info', duration: 0 })} style={{ flex: 1 }} />
            <AdminButton label="Dispatch Driver" onClick={() => toast.showToast({ message: `Dispatching driver to ${branch.name}`, type: 'success', duration: 0 })} variant="secondary" style={{ flex: 1 }} />
          </div>
        </DashboardCard>
      ))}
    </div>
  );
}

function ProgressBar({ label, detail, ratio, color }: { label: string; detail: string; ratio: number; color: string }) {
  const scale = Math.max(0, Math.min(1, ratio / 100));
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 4 }}>
        <span>{label}</span>
        <span>{detail}</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: '#eee', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: '100%',
          background: color, borderRadius: 4,
          transform: `scaleX(${scale})`,
          transformOrigin: 'left',
          transition: 'transform 0.4s',
        }} />
      </div>
    </div>
  );
}
