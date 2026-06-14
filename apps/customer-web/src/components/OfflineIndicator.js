"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const ui_1 = require("@spicegarden/ui");
const NetworkStatusContext_1 = require("../contexts/NetworkStatusContext");
const styles = require("./OfflineIndicator.module.css");
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
    return (<div className={styles.banner}>
      <div className={styles.content}>
        <div className={styles.icon}>📵</div>
        <div className={styles.textBlock}>
          <p className={styles.statusText}>You're offline</p>
          <p className={styles.lastSeenText}>
            Last seen: {minutes}m {seconds}s ago
          </p>
        </div>
        <ui_1.Button label="Retry" onClick={() => window.location.reload()} variant="outline" className={styles.retryButton}/>
      </div>
    </div>);
};
exports.default = OfflineIndicator;
