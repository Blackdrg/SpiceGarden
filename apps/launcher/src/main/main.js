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
const electron_ = require("electron");
const path = __importStar(require("path"));
const si = __importStar(require("systeminformation"));
const store_manager_ = require("./store-manager");
const docker_manager_ = require("./docker-manager");
const environment_manager_ = require("./environment-manager");
const process_manager_ = require("./process-manager");
const auto_updater_ = require("./auto-updater");
const isDev = process.env.NODE_ENV === 'development';
class SpiceGardenLauncher {
    mainWindow = null;
    tray = null;
    storeManager;
    dockerManager;
    envManager;
    processManager;
    appPath;
    autoUpdater;
    _appPath;
    getAppPath() {
        if (!this._appPath) {
            try {
                this._appPath = electron_.app.getAppPath ? electron_.app.getAppPath() : process.cwd();
            }
            catch {
                this._appPath = process.cwd();
            }
        }
        return this._appPath;
    }
    constructor() {
        this.storeManager = new store_manager_.StoreManager();
        this.dockerManager = new docker_manager_.DockerManager(this.storeManager);
        this.envManager = new environment_manager_.EnvironmentManager(this.storeManager);
        this.processManager = new process_manager_.ProcessManager(this.storeManager, this.dockerManager);
        this.autoUpdater = new auto_updater_.AutoUpdater();
    }
    async initialize() {
        await electron_.app.whenReady();
        this.createMainWindow();
        this.createTray();
        this.registerIPC();
        this.setupMenu();
        this.envManager.checkAndGenerateEnv();
    }
    createMainWindow() {
        this.mainWindow = new electron_.BrowserWindow({
            width: ,
            height: ,
            minWidth: ,
            minHeight: ,
            show: false,
            autoHideMenuBar: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                nodeIntegration: false,
                sandbox: true
            },
            icon: path.join(this.appPath, 'assets', 'icon.ico')
        });
        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow?.show();
        });
        if (isDev) {
            this.mainWindow.loadURL('http://localhost:');
        }
        else {
            this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
        }
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
    }
    createTray() {
        const iconPath = path.join(this.appPath, 'assets', 'icon.ico');
        this.tray = new electron_.Tray(iconPath);
        this.updateTrayMenu();
    }
    updateTrayMenu() {
        const menu = electron_.Menu.buildFromTemplate([
            { label: 'Show SpiceGarden Launcher', click: () => this.mainWindow?.show() },
            { type: 'separator' },
            { label: 'Start All Services', click: () => this.processManager.startAll() },
            { label: 'Stop All Services', click: () => this.processManager.stopAll() },
            { type: 'separator' },
            { label: 'Quit', click: () => electron_.app.quit() }
        ]);
        this.tray?.setContextMenu(menu);
    }
    setupMenu() {
        const menu = electron_.Menu.buildFromTemplate([
            {
                label: 'Application',
                submenu: [
                    { label: 'About', click: () => this.showAbout() },
                    { type: 'separator' },
                    { role: 'services', label: 'Services' },
                    { type: 'separator' },
                    { role: 'quit' }
                ]
            },
            {
                label: 'View',
                submenu: [
                    { role: 'reload' },
                    { role: 'resetZoom' },
                    { role: 'zoomIn' },
                    { role: 'zoomOut' },
                    { type: 'separator' },
                    { role: 'togglefullscreen' }
                ]
            }
        ]);
        electron_.Menu.setApplicationMenu(menu);
    }
    showAbout() {
        electron_.dialog.showMessageBox({
            type: 'info',
            title: 'About SpiceGarden Launcher',
            message: 'SpiceGarden Launcher v..',
            detail: 'Enterprise launcher for SpiceGarden Food Delivery Platform\nPowered by Electron',
            buttons: ['OK']
        });
    }
    registerIPC() {
        electron_.ipcMain.handle('check-prerequisites', async () => {
            return await this.envManager.checkPrerequisites();
        });
        electron_.ipcMain.handle('start-all', async () => {
            return await this.processManager.startAll();
        });
        electron_.ipcMain.handle('stop-all', async () => {
            return await this.processManager.stopAll();
        });
        electron_.ipcMain.handle('restart-services', async () => {
            return await this.processManager.restart();
        });
        electron_.ipcMain.handle('get-service-status', async () => {
            return await this.processManager.getStatus();
        });
        electron_.ipcMain.handle('get-system-info', async () => {
            return await this.getSystemInfo();
        });
        electron_.ipcMain.handle('get-docker-status', async () => {
            return await this.dockerManager.getStatus();
        });
        electron_.ipcMain.handle('open-url', async (_, url) => {
            await electron_.shell.openExternal(url);
            return { success: true };
        });
        electron_.ipcMain.handle('generate-env', async () => {
            return await this.envManager.generateEnv();
        });
        electron_.ipcMain.handle('reset-database', async () => {
            return await this.dockerManager.resetDatabases();
        });
        electron_.ipcMain.handle('check-ports', async () => {
            return await this.envManager.checkPorts();
        });
        electron_.ipcMain.handle('get-logs', async (_, service, lines) => {
            return await this.processManager.getLogs(service, lines);
        });
    }
    async getSystemInfo() {
        const cpu = await si.cpu();
        const mem = await si.mem();
        const osInfo = await si.osInfo();
        const load = await si.currentLoad();
        return {
            cpu: {
                model: cpu.model,
                cores: cpu.cores,
                speed: cpu.speed,
                usage: load.avgLoad
            },
            memory: {
                total: mem.total,
                available: mem.available,
                used: mem.used,
                usagePercent: ((mem.used / mem.total)  ).toFixed()
            },
            os: {
                platform: osInfo.platform,
                release: osInfo.release,
                arch: osInfo.arch
            }
        };
    }
    run() {
        electron_.app.whenReady().then(() => this.initialize());
        electron_.app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                this.processManager.stopAll();
            }
        });
        electron_.app.on('activate', () => {
            if (this.mainWindow === null) {
                this.createMainWindow();
            }
        });
        electron_.app.on('before-quit', () => {
            this.processManager.stopAll();
        });
    }
}
const launcher = new SpiceGardenLauncher();
launcher.run();
