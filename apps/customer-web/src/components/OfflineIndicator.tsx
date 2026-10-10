import { Button } from '@spicegarden/ui';
import { useNetworkStatusContext } from '../contexts/NetworkStatusContext';
import styles from './OfflineIndicator.module.css';

const OfflineIndicator = () => {
  const { isOnline, lastOnline } = useNetworkStatusContext();

  if (isOnline) {
    return null;
  }

  const timeOffline = lastOnline?.getTime() 
    ? Math.floor((new Date().getTime() - lastOnline.getTime()) / 1000) 
    : 0;

  const minutes = Math.floor(timeOffline / 60);
  const seconds = timeOffline % 60;

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <div className={styles.icon}>📵</div>
        <div className={styles.textBlock}>
          <p className={styles.statusText}>You're offline</p>
          <p className={styles.lastSeenText}>
            Last seen: {minutes}m {seconds}s ago
          </p>
        </div>
        <Button 
          label="Retry" 
          onClick={() => window.location.reload()} 
          variant="outline"
          className={styles.retryButton}
        />
      </div>
    </div>
  );
};

export default OfflineIndicator;