"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_ = require("electron");
electron_.contextBridge.exposeInMainWorld('electronAPI', {
    checkPrerequisites: () => electron_.ipcRenderer.invoke('check-prerequisites'),
    startAll: () => electron_.ipcRenderer.invoke('start-all'),
    stopAll: () => electron_.ipcRenderer.invoke('stop-all'),
    restartServices: () => electron_.ipcRenderer.invoke('restart-services'),
    getServiceStatus: () => electron_.ipcRenderer.invoke('get-service-status'),
    getSystemInfo: () => electron_.ipcRenderer.invoke('get-system-info'),
    getDockerStatus: () => electron_.ipcRenderer.invoke('get-docker-status'),
    openUrl: (url) => electron_.ipcRenderer.invoke('open-url', url),
    generateEnv: () => electron_.ipcRenderer.invoke('generate-env'),
    resetDatabase: () => electron_.ipcRenderer.invoke('reset-database'),
    checkPorts: () => electron_.ipcRenderer.invoke('check-ports'),
    getLogs: (service) => electron_.ipcRenderer.invoke('get-logs', service),
    onServiceStatusUpdate: (callback) => {
        electron_.ipcRenderer.on('service-status-update', (_, status) => callback(status));
    }
});
