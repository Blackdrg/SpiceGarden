"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsService = void 0;
const socket_io_client_1 = require("socket.io-client");
class WebSocketService {
    socket = null;
    reconnectAttempts = 0;
    maxReconnectAttempts = 10;
    reconnectDelay = 1000;
    messageQueue = [];
    pendingAcks = new Map();
    subscriptions = new Map();
    isConnected = false;
    currentOrderId = null;
    constructor() {
        this.initialize();
    }
    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    calculateBackoff(attempt) {
        const baseDelay = this.reconnectDelay;
        const maxDelay = 30000;
        const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
        const jitter = delay * 0.1 * Math.random();
        return Math.floor(delay + jitter);
    }
    initialize() {
        const backendUrl = globalThis.process?.env?.BACKEND_URL || 'http://localhost:3001';
        this.socket = (0, socket_io_client_1.io)(backendUrl, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 30000,
            reconnectionAttempts: this.maxReconnectAttempts,
            timeout: 10000,
        });
        this.socket.on('connect', () => {
            this.isConnected = true;
            this.reconnectAttempts = 0;
            console.log('WebSocket connected:', this.socket?.id);
            this.flushMessageQueue();
        });
        this.socket.on('disconnect', (reason) => {
            this.isConnected = false;
            console.log('WebSocket disconnected:', reason);
        });
        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            this.attemptReconnect();
        });
        this.socket.on('ack', (data) => {
            const pending = this.pendingAcks.get(data.messageId);
            if (pending) {
                clearTimeout(pending.timeout);
                pending.resolve({ status: 'acknowledged' });
                this.pendingAcks.delete(data.messageId);
            }
        });
        this.socket.on('message', (data) => {
            this.handleIncomingMessage(data);
        });
        this.socket.io.on('reconnect_attempt', (_attempt) => {
            this.reconnectAttempts++;
        });
        this.socket.io.on('reconnect', (_attempt) => {
            this.reconnectAttempts = 0;
            this.flushMessageQueue();
        });
    }
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            const delay = this.calculateBackoff(this.reconnectAttempts + 1);
            setTimeout(() => {
                if (this.socket) {
                    this.socket.connect();
                }
            }, delay);
        }
    }
    handleIncomingMessage(data) {
        if (data.requiresAck) {
            this.socket?.emit('ack', { messageId: data.id });
        }
        const handler = this.subscriptions.get(data.event);
        if (handler) {
            handler(data.data);
        }
    }
    flushMessageQueue() {
        while (this.messageQueue.length > 0) {
            const msg = this.messageQueue.shift();
            if (msg) {
                this.sendMessage(msg);
            }
        }
    }
    async connect() {
        if (!this.socket?.connected) {
            this.socket?.connect();
        }
        return new Promise((resolve) => {
            if (this.isConnected) {
                resolve(true);
            }
            else {
                this.socket?.once('connect', () => resolve(true));
            }
        });
    }
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
        this.isConnected = false;
    }
    subscribe(event, callback) {
        const wrappedCallback = (data) => {
            callback(data);
        };
        this.subscriptions.set(event, wrappedCallback);
        this.socket?.on(event, wrappedCallback);
        return () => {
            this.subscriptions.delete(event);
            this.socket?.off(event, wrappedCallback);
        };
    }
    unsubscribe(event) {
        const handler = this.subscriptions.get(event);
        if (handler) {
            this.socket?.off(event, handler);
            this.subscriptions.delete(event);
        }
    }
    sendMessage(data) {
        return new Promise((resolve, reject) => {
            if (!this.isConnected) {
                this.messageQueue.push(data);
                resolve({ status: 'queued', message: 'Message queued for delivery when online' });
                return;
            }
            if (data.requiresAck) {
                this.pendingAcks.set(data.id, {
                    resolve,
                    reject,
                    timeout: setTimeout(() => {
                        this.pendingAcks.delete(data.id);
                        reject(new Error('Acknowledgement timeout'));
                    }, 5000),
                });
            }
            else {
                resolve({ status: 'sent' });
            }
            this.socket?.emit('message', data);
        });
    }
    async joinRoom(room) {
        return this.sendMessage({
            id: this.generateMessageId(),
            event: 'join',
            data: { room },
            timestamp: Date.now(),
        });
    }
    async sendAcknowledgement(messageId) {
        return this.sendMessage({
            id: this.generateMessageId(),
            event: 'ack',
            data: { messageId },
            timestamp: Date.now(),
        });
    }
    isSocketConnected() {
        return this.isConnected;
    }
    getReconnectAttempts() {
        return this.reconnectAttempts;
    }
    getQueueLength() {
        return this.messageQueue.length;
    }
}
exports.wsService = new WebSocketService();
exports.default = WebSocketService;
