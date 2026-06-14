import React, { useState, useEffect } from 'react';
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

export const Dashboard: React.FC = () => {
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const status = await window.electronAPI.getServiceStatus();
      setServiceStatus(status);
      const sysInfo = await window.electronAPI.getSystemInfo();
      setSystemInfo(sysInfo);
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>SpiceGarden Launcher</h1>
        <p>Enterprise Launcher for Food Delivery Platform</p>
      </header>

      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button type="button" onClick={() => window.electronAPI.startAll()}>Start All</button>
          <button type="button" onClick={() => window.electronAPI.stopAll()}>Stop All</button>
          <button type="button" onClick={() => window.electronAPI.restartServices()}>Restart</button>
          <button type="button" onClick={() => window.electronAPI.openUrl('http://localhost:3001')}>
            Open Customer App
          </button>
          <button type="button" onClick={() => window.electronAPI.openUrl('http://localhost:3002')}>
            Open Restaurant Dashboard
          </button>
          <button type="button" onClick={() => window.electronAPI.openUrl('http://localhost:3003')}>
            Open Admin Dashboard
          </button>
          <button type="button" onClick={() => window.electronAPI.resetDatabase()}>Reset Database</button>
          <button type="button" onClick={() => window.electronAPI.openUrl('file://' + process.cwd() + '/launcher-logs')}>
            Open Logs
          </button>
        </div>
      </section>

      <section className="services-section">
        <h2>Services Status</h2>
        <div className="services-grid">
          {serviceStatus?.map((service) => (
            <ServiceStatusCard key={service.name} {...service} />
          ))}
        </div>
      </section>

      <section className="system-monitor">
        <h2>System Monitor</h2>
        <div className="monitor-grid">
          <div className="monitor-card">
            <h3>CPU Usage</h3>
            <p>{systemInfo?.cpu?.usage ? `${systemInfo.cpu.usage.toFixed(1)}%` : 'N/A'}</p>
          </div>
          <div className="monitor-card">
            <h3>RAM Usage</h3>
            <p>{systemInfo?.memory?.usagePercent ? `${systemInfo.memory.usagePercent}%` : 'N/A'}</p>
          </div>
          <div className="monitor-card">
            <h3>Platform</h3>
            <p>{systemInfo?.os?.platform || 'N/A'}</p>
          </div>
        </div>
      </section>
    </div>
  );
};