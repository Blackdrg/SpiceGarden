import React from 'react';

interface ServiceStatusCardProps {
  name: string;
  status: 'running' | 'stopped' | 'starting' | 'error';
  port?: number;
}

const statusColors = {
  running: 'var(--color-running)',
  stopped: 'var(--color-stopped)',
  starting: 'var(--color-starting)',
  error: 'var(--color-error)'
};

const statusLabels = {
  running: 'Running',
  stopped: 'Stopped',
  starting: 'Starting',
  error: 'Error'
};

const ServerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" />
    <line x1="6" y1="18" x2="6.01" y2="18" />
  </svg>
);

const StatusDot = ({ color }: { color: string }) => (
  <span className="status-dot" style={{ backgroundColor: color }} aria-hidden="true" />
);

export const ServiceStatusCard: React.FC<ServiceStatusCardProps> = ({ name, status, port }) => {
  return (
    <div
      className="service-card"
      style={{ '--card-accent-color': statusColors[status] } as React.CSSProperties}
      role="status"
      aria-label={`${name} is ${statusLabels[status]}${port ? ` on port ${port}` : ''}`}
    >
      <div className="service-header">
        <div className="service-title">
          <div className="service-icon" aria-hidden="true">
            <ServerIcon />
          </div>
          <h3>{name}</h3>
        </div>
        <span className="status-badge" style={{ backgroundColor: statusColors[status], color: '#fff' }}>
          <StatusDot color="#fff" />
          {statusLabels[status]}
        </span>
      </div>
      {port && (
        <div className="port-info">
          <span className="port-number">:{port}</span>
        </div>
      )}
    </div>
  );
};
