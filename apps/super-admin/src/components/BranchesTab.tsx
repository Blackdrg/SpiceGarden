import type { BranchStatus } from './types';
import styles from './BranchesTab.module.css';
import { AdminButton } from './AdminButton';
import { DashboardCard } from './DashboardCard';
import { useToast } from '@spicegarden/ui';
import {
  IconStore,
  IconClock,
  IconTruck,
  IconExternalLink,
  IconUserPlus,
} from './icons/SGIcon';

const BRANCH_STATUS_MAP: Record<BranchStatus['status'], { label: string; className: string }> = {
  operational: { label: 'Operational', className: styles.branchStatusOperational },
  delayed: { label: 'Delayed', className: styles.branchStatusDelayed },
  critical: { label: 'Critical', className: styles.branchStatusCritical },
};

export function BranchesTab({ branches }: { branches: BranchStatus[] }) {
  const toast = useToast();
  return (
    <div className={styles.branchesGrid}>
      {branches.map((branch) => {
        const statusInfo = BRANCH_STATUS_MAP[branch.status];
        const prepRatio = Math.min(100, (branch.avgPrepMins / 18) * 100);
        const driverRatio = branch.orderCount === 0 ? 100 : Math.min(100, (branch.driversAssigned / branch.orderCount) * 100);
        const prepColor = branch.avgPrepMins > 20 ? '#EF4444' : '#10B981';
        const driverColor = branch.driversAssigned < branch.orderCount * 0.3 ? '#F59E0B' : '#3B82F6';

        return (
          <DashboardCard
            key={branch.name}
            title={branch.name}
            sub={`${branch.orderCount} orders · ${branch.driversAssigned} drivers assigned`}
            iconVariant={branch.status === 'operational' ? 'success' : branch.status === 'delayed' ? 'warning' : 'danger'}
            titleIcon={<IconStore size={16} color={branch.status === 'operational' ? '#10B981' : branch.status === 'delayed' ? '#F59E0B' : '#EF4444'} />}
          >
            <div className={styles.branchHeader}>
              <span className={`${styles.branchStatus} ${statusInfo.className}`}>
                {statusInfo.label}
              </span>
              <span className={styles.branchPrepInfo}>
                Avg prep: <strong className={branch.avgPrepMins > 20 ? styles.prepWarning : styles.prepGood}>{branch.avgPrepMins}m</strong>
              </span>
            </div>

            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span className={styles.progressLabel}>Prep time</span>
                <span className={styles.progressDetail}>{branch.avgPrepMins} / 18 min target</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${prepRatio}%`, background: prepColor }} />
              </div>
            </div>

            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span className={styles.progressLabel}>Driver coverage</span>
                <span className={styles.progressDetail}>{branch.driversAssigned} drivers / {branch.orderCount} orders</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${driverRatio}%`, background: driverColor }} />
              </div>
            </div>

            <div className={styles.branchButtons}>
              <button
                type="button"
                className={styles.branchButtonPrimary}
                onClick={() => toast.showToast({ message: `Opening KDS for ${branch.name}`, type: 'info', duration: 0 })}
              >
                <IconExternalLink size={14} color="white" /> View KDS
              </button>
              <button
                type="button"
                className={styles.branchButtonSecondary}
                onClick={() => toast.showToast({ message: `Dispatching driver to ${branch.name}`, type: 'success', duration: 0 })}
              >
                <IconUserPlus size={14} color="#374151" /> Dispatch Driver
              </button>
            </div>
          </DashboardCard>
        );
      })}
    </div>
  );
}
