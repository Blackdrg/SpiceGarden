"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const ui_1 = require("@spicegarden/ui");
const NetworkStatusContext_1 = require("../contexts/NetworkStatusContext");
const OfflineIndicator = () => {
    const { isOnline, lastOnline } = (0, NetworkStatusContext_1.useNetworkStatusContext)();
    if (isOnline) {
        return null;
    }
    const timeOffline = lastOnline?.getTime()
        ? Math.floor((new Date().getTime() - lastOnline.getTime()) / 1000)
        : 0;
    const minutes = Math.floor(timeOffline / 60);
    const seconds = timeOffline % 60;
    return (<div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: 40,
            backgroundColor: '#ffebee',
            color: '#c62828',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 16 }}>📵</div>
        <div>
          <p style={{ margin: 0, fontSize: 14 }}>You're offline</p>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>
            Last seen: {minutes}m {seconds}s ago
          </p>
        </div>
        <ui_1.Button label="Retry" onClick={() => window.location.reload()} variant="outline" style={{ marginLeft: 16 }}/>
      </div>
    </div>);
};
exports.default = OfflineIndicator;
