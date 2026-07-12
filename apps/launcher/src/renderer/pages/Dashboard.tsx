import React, { useState, useEffect, useCallback } from 'react';
import { ServiceStatusCard } from '../components/ServiceStatusCard';

type ServiceStatus = {
  name: string;
  status: 'running' | 'stopped' | 'error';
  uptime?: number;
};

type SystemInfo = {
  cpu?: { usage?: number };
  memory?: { usagePercent?: string };
  os?: { platform?: string };
};

declare global {
  interface Window {
    electronAPI: {
      getServiceStatus: () => Promise<ServiceStatus[]>;
      startAll: () => Promise<void>;
      stopAll: () => Promise<void>;
      restartServices: () => Promise<void>;
      openUrl: (url: string) => Promise<void>;
      resetDatabase: () => Promise<void>;
      getSystemInfo: () => Promise<SystemInfo>;
      getDockerStatus: () => Promise<Record<string, unknown>>;
    };
  }
}

const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const StopIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const DatabaseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const FolderIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const CpuIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" />
    <line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" />
    <line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" />
    <line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" />
    <line x1="1" y1="14" x2="4" y2="14" />
  </svg>
);

const MemoryIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 7h20" />
    <path d="M2 17h20" />
    <path d="M6 7v10" />
    <path d="M10 7v10" />
    <path d="M14 7v10" />
    <path d="M18 7v10" />
  </svg>
);

const PlatformIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spinner" aria-hidden="true">
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);

export const Dashboard: React.FC = () => {
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActing, setIsActing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const status = await window.electronAPI.getServiceStatus();
      setServiceStatus(status);
      const sysInfo = await window.electronAPI.getSystemInfo();
      setSystemInfo(sysInfo);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleAction = async (action: () => Promise<void>, actionName: string) => {
    setIsActing(true);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : `${actionName} failed`);
    } finally {
      setIsActing(false);
    }
  };

  const renderActionButtons = () => {
    const buttons: { label: string; onClick: () => void; variant: 'primary' | 'danger' | 'warning' | 'secondary'; icon: React.ReactNode }[] = [
      { label: 'Start All', onClick: () => handleAction(() => window.electronAPI.startAll(), 'Start All'), variant: 'primary', icon: <PlayIcon /> },
      { label: 'Stop All', onClick: () => handleAction(() => window.electronAPI.stopAll(), 'Stop All'), variant: 'danger', icon: <StopIcon /> },
      { label: 'Restart', onClick: () => handleAction(() => window.electronAPI.restartServices(), 'Restart'), variant: 'warning', icon: <RefreshIcon /> },
      { label: 'Customer App', onClick: () => handleAction(() => window.electronAPI.openUrl('http://localhost:3001'), 'Open Customer App'), variant: 'secondary', icon: <ExternalLinkIcon /> },
      { label: 'Restaurant', onClick: () => handleAction(() => window.electronAPI.openUrl('http://localhost:3002'), 'Open Restaurant Dashboard'), variant: 'secondary', icon: <ExternalLinkIcon /> },
      { label: 'Admin', onClick: () => handleAction(() => window.electronAPI.openUrl('http://localhost:3003'), 'Open Admin Dashboard'), variant: 'secondary', icon: <ExternalLinkIcon /> },
      { label: 'Reset DB', onClick: () => handleAction(() => window.electronAPI.resetDatabase(), 'Reset Database'), variant: 'danger', icon: <DatabaseIcon /> },
      { label: 'Logs', onClick: () => handleAction(() => window.electronAPI.openUrl('file://' + process.cwd() + '/launcher-logs'), 'Open Logs'), variant: 'secondary', icon: <FolderIcon /> },
    ];

    return buttons.map((btn) => (
      <button
        key={btn.label}
        type="button"
        className={`btn btn--${btn.variant}`}
        onClick={btn.onClick}
        disabled={isActing}
        aria-label={btn.label}
      >
        {isActing ? <SpinnerIcon /> : btn.icon}
        {btn.label}
      </button>
    ));
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="logo">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <h1>SpiceGarden</h1>
        </div>
        <p className="subtitle">Enterprise Launcher for Food Delivery Platform</p>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
          <button type="button" className="btn btn--ghost" onClick={fetchData} aria-label="Retry">
            Retry
          </button>
        </div>
      )}

      <section className="quick-actions" aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading">Quick Actions</h2>
        <div className="action-buttons">
          {renderActionButtons()}
        </div>
      </section>

      <section className="services-section" aria-labelledby="services-heading">
        <h2 id="services-heading">Services Status</h2>
        {loading ? (
          <div className="services-grid" aria-busy="true" aria-label="Loading services">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-card" aria-hidden="true">
                <div className="skeleton-line skeleton-title" />
                <div className="skeleton-line skeleton-badge" />
              </div>
            ))}
          </div>
        ) : (
          <div className="services-grid">
            {serviceStatus?.map((service) => (
              <ServiceStatusCard key={service.name} {...service} />
            ))}
          </div>
        )}
      </section>

      <section className="system-monitor" aria-labelledby="monitor-heading">
        <h2 id="monitor-heading">System Monitor</h2>
        {loading ? (
          <div className="monitor-grid" aria-busy="true" aria-label="Loading system info">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-card skeleton-monitor" aria-hidden="true">
                <div className="skeleton-line skeleton-icon" />
                <div className="skeleton-line skeleton-value" />
              </div>
            ))}
          </div>
        ) : (
          <div className="monitor-grid">
            <div className="monitor-card">
              <div className="monitor-icon" aria-hidden="true">
                <CpuIcon />
              </div>
              <div className="monitor-info">
                <span className="monitor-label">CPU Usage</span>
                <span className="monitor-value" aria-label={`CPU Usage ${systemInfo?.cpu?.usage ? `${systemInfo.cpu.usage.toFixed(1)}%` : 'N/A'}`}>
                  {systemInfo?.cpu?.usage ? `${systemInfo.cpu.usage.toFixed(1)}%` : 'N/A'}
                </span>
              </div>
            </div>
            <div className="monitor-card">
              <div className="monitor-icon" aria-hidden="true">
                <MemoryIcon />
              </div>
              <div className="monitor-info">
                <span className="monitor-label">RAM Usage</span>
                <span className="monitor-value" aria-label={`RAM Usage ${systemInfo?.memory?.usagePercent ? `${systemInfo.memory.usagePercent}%` : 'N/A'}`}>
                  {systemInfo?.memory?.usagePercent ? `${systemInfo.memory.usagePercent}%` : 'N/A'}
                </span>
              </div>
            </div>
            <div className="monitor-card">
              <div className="monitor-icon" aria-hidden="true">
                <PlatformIcon />
              </div>
              <div className="monitor-info">
                <span className="monitor-label">Platform</span>
                <span className="monitor-value">{systemInfo?.os?.platform || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
