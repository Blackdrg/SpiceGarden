"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k) {
    if (k === undefined) k = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k, desc);
}) : (function(o, m, k, k) {
    if (k === undefined) k = k;
    o[k] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = ; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dashboard = void ;
const react_ = __importStar(require("react"));
const ServiceStatusCard_ = require("../components/ServiceStatusCard");
const Dashboard = () => {
    const [serviceStatus, setServiceStatus] = (, react_.useState)([]);
    const [systemInfo, setSystemInfo] = (, react_.useState)(null);
    (, react_.useEffect)(() => {
        const fetchData = async () => {
            const status = await window.electronAPI.getServiceStatus();
            setServiceStatus(status);
            const sysInfo = await window.electronAPI.getSystemInfo();
            setSystemInfo(sysInfo);
        };
        fetchData();
        const interval = setInterval(fetchData, );
        return () => clearInterval(interval);
    }, []);
    return (<div className="dashboard">
      <header className="dashboard-header">
        <h>SpiceGarden Launcher</h>
        <p>Enterprise Launcher for Food Delivery Platform</p>
      </header>

      <section className="quick-actions">
        <h>Quick Actions</h>
        <div className="action-buttons">
          <button onClick={() => window.electronAPI.startAll()}>Start All</button>
          <button onClick={() => window.electronAPI.stopAll()}>Stop All</button>
          <button onClick={() => window.electronAPI.restartServices()}>Restart</button>
          <button onClick={() => window.electronAPI.openUrl('http://localhost:')}>
            Open Customer App
          </button>
          <button onClick={() => window.electronAPI.openUrl('http://localhost:')}>
            Open Restaurant Dashboard
          </button>
          <button onClick={() => window.electronAPI.openUrl('http://localhost:')}>
            Open Admin Dashboard
          </button>
          <button onClick={() => window.electronAPI.resetDatabase()}>Reset Database</button>
          <button onClick={() => window.electronAPI.openUrl('file://' + process.cwd() + '/launcher-logs')}>
            Open Logs
          </button>
        </div>
      </section>

      <section className="services-section">
        <h>Services Status</h>
        <div className="services-grid">
          {serviceStatus?.map((service) => (<ServiceStatusCard_.ServiceStatusCard key={service.name} {...service}/>))}
        </div>
      </section>

      <section className="system-monitor">
        <h>System Monitor</h>
        <div className="monitor-grid">
          <div className="monitor-card">
            <h>CPU Usage</h>
            <p>{systemInfo?.cpu?.usage ? `${systemInfo.cpu.usage.toFixed()}%` : 'N/A'}</p>
          </div>
          <div className="monitor-card">
            <h>RAM Usage</h>
            <p>{systemInfo?.memory?.usagePercent ? `${systemInfo.memory.usagePercent}%` : 'N/A'}</p>
          </div>
          <div className="monitor-card">
            <h>Platform</h>
            <p>{systemInfo?.os?.platform || 'N/A'}</p>
          </div>
        </div>
      </section>
    </div>);
};
exports.Dashboard = Dashboard;
