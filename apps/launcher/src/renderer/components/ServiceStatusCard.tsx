import React from 'react';

interface ServiceStatusCardProps {
  name: string;
  status: 'running' | 'stopped' | 'starting' | 'error';
  port?: number;
}

const statusColors = {
  running: '#10b981',
  stopped: '#6b7280',
  starting: '#f59e0b',
  error: '#ef4444'
};

const statusLabels = {
  running: 'Running',
  stopped: 'Stopped',
  starting: 'Starting',
  error: 'Error'
};

export const ServiceStatusCard: React.FC<ServiceStatusCardProps> = ({ name, status, port }) => {
  return (
    <div className="service-card">
      <div className="service-header">
        <h3>{name}</h3>
        <span className="status-badge" style={{ backgroundColor: statusColors[status] }}>
          {statusLabels[status]}
        </span>
      </div>
      {port && <p className="port-info">Port: {port}</p>}
    </div>
  );
};