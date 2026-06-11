"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceStatusCard = void ;
const react_ = __importDefault(require("react"));
const ServiceStatusCard = ({ name, status, port }) => {
    const statusColors = {
        running: 'b',
        stopped: 'b',
        starting: 'feb',
        error: 'ef'
    };
    const statusLabels = {
        running: 'Running',
        stopped: 'Stopped',
        starting: 'Starting',
        error: 'Error'
    };
    return (<div className="service-card">
      <div className="service-header">
        <h>{name}</h>
        <span className="status-badge" style={{ backgroundColor: statusColors[status] }}>
          {statusLabels[status]}
        </span>
      </div>
      {port && <p className="port-info">Port: {port}</p>}
    </div>);
};
exports.ServiceStatusCard = ServiceStatusCard;
