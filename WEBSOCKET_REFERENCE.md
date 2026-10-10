# WebSocket Reference

**Version:** 1.0.0
**Date:** 2026-06-26
**Classification:** Verified from source code

## WebSocket System

SpiceGarden uses **Socket.IO** for real-time communication with two primary gateways.

## Gateways

### TrackingGateway

**File:** `apps/backend/src/infra/tracking/tracking.gateway.ts`
**Namespace:** `/` (default)

#### Features
- Driver location tracking
- Order status broadcasts
- Driver lifecycle events
- Acknowledgement-based messaging
- Connection rate limiting

#### Configuration
```typescript
@WebSocketGateway({
  cors: { origin: isAllowedOrigin, credentials: true },
  namespace: '/',
  maxHttpBufferSize: 1024,
  allowEIO3: false,
  pingInterval: 10000,
  pingTimeout: 20000,
})
```

### KdsGateway

**File:** `apps/backend/src/services/restaurant/kds.gateway.ts`
**Namespace:** `/kds`

#### Features
- Kitchen Display System updates
- Real-time order notifications
- Prep status tracking

#### Configuration
```typescript
@WebSocketGateway({
  namespace: 'kds',
  maxHttpBufferSize: 1024,
  allowEIO3: false,
  cors: { origin: isAllowedOrigin, credentials: true },
})
```

## Event Reference

### TrackingGateway Events (`/`)

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `connected` | Server → Client | `{ status: string, serverTime: number }` | Connection confirmed |
| `ping` | Client → Server | - | Heartbeat ping |
| `pong` | Server → Client | `{ status: string, serverTime: number }` | Heartbeat pong |
| `join` | Client → Server | `{ room: string }` | Join a room |
| `message` | Bidirectional | `{ id, event, data, timestamp, ack? }` | Generic message |
| `ack` | Client → Server | `{ messageId: string }` | Message acknowledgement |
| `updateLocation` | Client → Server | `{ driverId, lat, lng, heading?, speed? }` | Driver location |
| `locationUpdate` | Server → Client | `{ driverId, lat, lng, heading?, speed?, timestamp, messageId }` | Location broadcast |
| `driverAssigned` | Server → Client | `{ driverId, orderId }` | Assignment notification |
| `orderStatusUpdate` | Server → Client | `{ status, orderId }` | Status change |
| `driverEvent` | Server → Client | `{ driverId, orderId?, event }` | Driver event |

### KdsGateway Events (`/kds`)

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `newOrder` | Server → Client | Order data | New order to kitchen |
| `updatePrepStatus` | Client → Server | `{ orderId, status, branchId }` | Prep status update |
| `orderStatusUpdated` | Server → Client | `{ orderId, status, branchId }` | Status broadcast |

### Registered Namespaces

| Namespace | Gateway | Purpose |
|-----------|---------|---------|
| `/` | TrackingGateway | Tracking, orders, drivers |
| `/kds` | KdsGateway | Kitchen operations |
| `/tracking` | (uses default) | Dedicated tracking |
| `/driver` | (uses default) | Driver events |
| `/admin` | (placeholder) | Admin updates |

## Room Management

### Room Patterns
```
tracking:{driverId}
kds:{branchId}
order:{orderId}
driver:{driverId}
```

### Join/Leave
```typescript
client.join(`tracking:${driverId}`);
client.leave(`tracking:${driverId}`);
```

## Security

### Origin Validation
```typescript
function isAllowedOrigin(origin: string): boolean {
  // Strict whitelist check against CORS_ALLOWED_ORIGINS
}
```

### Connection Rate Limiting
```typescript
const WS_RATE_LIMIT_MAX = 10; // per window
const WS_RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
```

### Input Validation
```typescript
const ROOM_PATTERN = /^[a-zA-Z0-9:_-]{1,128}$/;
const DRIVER_ID_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;
const BRANCH_ID_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;
```

### Location Bounds
```typescript
lat: -90 to 90
lng: -180 to 180
```

## Message Acknowledgement

### Pattern
```typescript
// Client sends with ack flag
{ id, event, data, ack: true }

// Server waits for acknowledgement
// Timeout: WS_ACK_TIMEOUT_MS (default 5000ms)
```

### Implementation
- Pending acks stored in Map
- Timeout creates promise
- Cleanup on disconnect

## Connection Management

### Lifecycle
```typescript
handleConnection(client: Socket) // Validate origin, register client
handleDisconnect(client: Socket) // Cleanup acks, remove client
```

### Connection Tracking
- `connectedClients`: Map of active connections
- `connectionAttempts`: Rate limit tracking
- `messageQueue`: Undelivered messages per driver

## Client Usage

### JavaScript/TypeScript
```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  transports: ['websocket'],
  withCredentials: true,
});

// Join room
socket.emit('join', { room: `tracking:${driverId}` });

// Listen for updates
socket.on('locationUpdate', (data) => {
  console.log(data.lat, data.lng);
});

// Send location
socket.emit('updateLocation', {
  driverId: '123',
  lat: 12.9716,
  lng: 77.5946,
});
```

## Scaling Considerations

### Single Instance
- All rooms in memory
- Direct client management

### Multi-Instance (Future)
- Requires Socket.IO Redis adapter
- Rooms distributed across instances
- Sticky sessions at load balancer

## Performance

### Limits
- Max HTTP buffer: 1024 bytes (configurable)
- Max connections per IP: 10 per minute
- Ping interval: 10s
- Ping timeout: 20s

### Metrics
- Active connections: `server.engine.clientsCount`
- Namespace stats: Per-namespace client count
