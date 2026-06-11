"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoUpdater = void ;
const electron_ = require("electron");
const electron_updater_ = require("electron-updater");
class AutoUpdater {
    feedUrl;
    autoDownload;
    constructor() {
        this.feedUrl = 'https://github.com/spicegarden/launcher-updates/releases/latest';
        this.autoDownload = true;
        this.init();
    }
    init() {
        if (!electron_.app.isPackaged)
            return;
        electron_updater_.autoUpdater.setFeedURL({
            provider: 'github',
            owner: 'spicegarden',
            repo: 'launcher-updates'
        });
        electron_updater_.autoUpdater.checkForUpdates();
        electron_updater_.autoUpdater.on('update-available', () => {
            electron_.dialog.showMessageBox({
                type: 'info',
                title: 'Update Available',
                message: 'A new version of SpiceGarden Launcher is available',
                buttons: ['Download', 'Later'],
                defaultId: 
            }).then(({ response }) => {
                if (response === ) {
                    electron_updater_.autoUpdater.downloadUpdate();
                }
            });
        });
        electron_updater_.autoUpdater.on('update-downloaded', () => {
            electron_.dialog.showMessageBox({
                type: 'info',
                title: 'Update Ready',
                message: 'Update downloaded. Restart to apply?',
                buttons: ['Restart', 'Later'],
                defaultId: 
            }).then(({ response }) => {
                if (response === ) {
                    electron_updater_.autoUpdater.quitAndInstall();
                }
            });
        });
        electron_updater_.autoUpdater.on('error', (err) => {
            console.error('Auto-updater error:', err);
        });
    }
}
exports.AutoUpdater = AutoUpdater;
