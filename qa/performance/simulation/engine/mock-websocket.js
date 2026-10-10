/**
 * SPICEGARDEN SIMULATION - Mock WebSocket / Socket.IO Layer
 * In-process high-throughput connection manager representing up to 70k+ concurrent tracking sessions.
 * Simulates connect, authenticate, subscribe, location updates, order updates, heartbeat, reconnect, churn.
 */

class MockWebSocketManager {
  constructor() {
    this.sessions = new Map(); // connectionId -> Session
    this.orderRooms = new Map(); // orderId -> Set(connectionId)
    this.driverRooms = new Map(); // driverId -> Set(connectionId)
    this.tenantRooms = new Map(); // tenantId -> Set(connectionId)

    this.metrics = {
      activeConnections: 0,
      totalConnected: 0,
      totalDisconnected: 0,
      totalMessagesSent: 0,
      totalBroadcasts: 0,
      droppedMessages: 0,
      reconnectCount: 0,
      latencies: [],
      errorCount: 0
    };
  }

  createSession({ userId, orderId, driverId, tenantId }) {
    const connectionId = `ws_${Math.random().toString(36).substring(2)}_${Date.now()}`;
    const session = {
      connectionId,
      userId,
      orderId,
      driverId,
      tenantId,
      state: 'OPEN',
      createdAt: Date.now(),
      lastHeartbeat: Date.now(),
      messageCount: 0,
      subscriptions: new Set()
    };

    this.sessions.set(connectionId, session);
    this.metrics.activeConnections++;
    this.metrics.totalConnected++;

    // Auto-subscribe to order room
    if (orderId) {
      if (!this.orderRooms.has(orderId)) {
        this.orderRooms.set(orderId, new Set());
      }
      this.orderRooms.get(orderId).add(connectionId);
      session.subscriptions.add(`order:${orderId}`);
    }

    if (driverId) {
      if (!this.driverRooms.has(driverId)) {
        this.driverRooms.set(driverId, new Set());
      }
      this.driverRooms.get(driverId).add(connectionId);
      session.subscriptions.add(`driver:${driverId}`);
    }

    return session;
  }

  sendHeartbeat(connectionId) {
    const session = this.sessions.get(connectionId);
    if (!session || session.state !== 'OPEN') return false;
    session.lastHeartbeat = Date.now();
    return true;
  }

  broadcastLocationUpdate(driverId, orderId, location) {
    const startMs = performance.now();
    this.metrics.totalBroadcasts++;

    const connections = this.orderRooms.get(orderId);
    if (!connections || connections.size === 0) {
      return 0;
    }

    let sent = 0;
    for (const connId of connections) {
      const session = this.sessions.get(connId);
      if (session && session.state === 'OPEN') {
        session.messageCount++;
        session.lastMessage = {
          type: 'DRIVER_LOCATION_UPDATE',
          driverId,
          orderId,
          location,
          timestamp: Date.now()
        };
        sent++;
        this.metrics.totalMessagesSent++;
      } else {
        this.metrics.droppedMessages++;
      }
    }

    const duration = performance.now() - startMs;
    this.metrics.latencies.push(duration);
    if (this.metrics.latencies.length > 50000) {
      this.metrics.latencies.splice(0, 10000);
    }
    return sent;
  }

  broadcastOrderStatus(orderId, status, metadata = {}) {
    const startMs = performance.now();
    this.metrics.totalBroadcasts++;

    const connections = this.orderRooms.get(orderId);
    if (!connections || connections.size === 0) return 0;

    let sent = 0;
    for (const connId of connections) {
      const session = this.sessions.get(connId);
      if (session && session.state === 'OPEN') {
        session.messageCount++;
        session.lastMessage = {
          type: 'ORDER_STATUS_UPDATE',
          orderId,
          status,
          metadata,
          timestamp: Date.now()
        };
        sent++;
        this.metrics.totalMessagesSent++;
      }
    }
    return sent;
  }

  disconnect(connectionId) {
    const session = this.sessions.get(connectionId);
    if (!session) return;

    session.state = 'CLOSED';
    if (session.orderId && this.orderRooms.has(session.orderId)) {
      this.orderRooms.get(session.orderId).delete(connectionId);
    }
    if (session.driverId && this.driverRooms.has(session.driverId)) {
      this.driverRooms.get(session.driverId).delete(connectionId);
    }
    this.sessions.delete(connectionId);
    this.metrics.activeConnections = Math.max(0, this.metrics.activeConnections - 1);
    this.metrics.totalDisconnected++;
  }

  massDisconnect(count = 1000) {
    let disconnected = 0;
    for (const connId of this.sessions.keys()) {
      if (disconnected >= count) break;
      this.disconnect(connId);
      disconnected++;
    }
    return disconnected;
  }

  reconnect(oldConnectionId, newParams = {}) {
    this.disconnect(oldConnectionId);
    this.metrics.reconnectCount++;
    return this.createSession(newParams);
  }

  getMetrics() {
    const sorted = [...this.metrics.latencies].sort((a, b) => a - b);
    const count = sorted.length;
    const approxMemoryPerSessionBytes = 420; // 420 bytes per tracking state

    return {
      activeConnections: this.metrics.activeConnections,
      totalConnected: this.metrics.totalConnected,
      totalDisconnected: this.metrics.totalDisconnected,
      totalMessagesSent: this.metrics.totalMessagesSent,
      totalBroadcasts: this.metrics.totalBroadcasts,
      droppedMessages: this.metrics.droppedMessages,
      reconnectCount: this.metrics.reconnectCount,
      estimatedMemoryMb: parseFloat(((this.metrics.activeConnections * approxMemoryPerSessionBytes) / (1024 * 1024)).toFixed(2)),
      p50MessageLatencyMs: count ? sorted[Math.floor(count * 0.50)] : 0,
      p95MessageLatencyMs: count ? sorted[Math.floor(count * 0.95)] : 0,
      p99MessageLatencyMs: count ? sorted[Math.floor(count * 0.99)] : 0,
    };
  }
}

module.exports = { MockWebSocketManager };
