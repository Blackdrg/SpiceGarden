# Notifications

## Architecture

SpiceGarden implements a multi-channel notification system supporting push notifications (FCM/APNs), SMS (Twilio), email (SendGrid/SMTP), and in-app notifications. The system uses BullMQ for reliable dispatch with retry logic.

## Module Structure

**Backend:**
- `apps/backend/src/services/notifications/notification.module.ts` - Main module
- `apps/backend/src/services/notifications/notification.service.ts` - Core service
- `apps/backend/src/services/notifications/production-notification.service.ts` - Production implementation
- `apps/backend/src/services/notifications/notification-preferences.service.ts` - Preferences management
- `apps/backend/src/services/notifications/device.controller.ts` - Device registration
- `apps/backend/src/services/notifications/notification-preferences.controller.ts` - Preferences API
- `apps/backend/src/services/notifications/queue/notification-queue.controller.ts` - Queue management

**Frontend:**
- `apps/customer-web/src/pages/notifications.tsx` - Notification preferences page
- `apps/customer-mobile/src/screens/NotificationsScreen.tsx` - Mobile notification center

## Notification Types

### Channels

| Channel | Provider | Platform | Status |
|---------|----------|----------|--------|
| Push | FCM (Firebase Cloud Messaging) | Android | ACTIVE |
| Push | APNs (Apple Push Notification service) | iOS | ACTIVE (requires APNs key) |
| SMS | Twilio | All | ACTIVE |
| Email | SendGrid | All | ACTIVE |
| Email | SMTP | All | ACTIVE (fallback) |
| In-App | Internal queue | All | ACTIVE |

### Event Types

| Event | Trigger | Channels | Priority |
|-------|---------|----------|----------|
| Order Placed | Customer creates order | Push, In-App | High |
| Order Confirmed | Restaurant accepts | Push, In-App | High |
| Order Preparing | Kitchen starts | Push, In-App | Medium |
| Order Ready | Kitchen complete | Push, In-App | High |
| Driver Assigned | Driver matched | Push, In-App | High |
| Driver Picked Up | Order collected | Push, In-App | High |
| Order Delivered | Delivery complete | Push, In-App | High |
| Order Cancelled | Cancellation | Push, In-App | High |
| Payment Success | Payment confirmed | Push, Email | Medium |
| Payment Failed | Payment error | Push, Email, SMS | High |
| Refund Processed | Refund completed | Push, Email | Medium |
| Promotion | Marketing offers | Push, Email | Low |
| Driver Incentive | Bonus earned | Push, In-App | Medium |

## Notification Entity

**File:** `apps/backend/src/db/entities/notification.entity.ts`

```typescript
@Entity('notifications')
class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  type: string; // push, sms, email, in_app

  @Column()
  channel: string;

  @Column()
  title: string;

  @Column()
  body: string;

  @Column({ type: 'jsonb' })
  data: object;

  @Column({ type: 'enum', enum: NotificationStatus })
  status: NotificationStatus; // queued, sent, delivered, failed, read

  @Column()
  priority: string; // low, medium, high, critical

  @Column({ nullable: true })
  sent_at: Date;

  @Column({ nullable: true })
  delivered_at: Date;

  @Column({ nullable: true })
  read_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
```

### Notification Status Enum

**File:** `apps/backend/src/db/entities/notification-status.enum.ts`

```typescript
enum NotificationStatus {
  QUEUED = 'queued',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  READ = 'read',
}
```

## Notification Preferences

### Preferences Entity

**File:** `apps/backend/src/db/entities/notification-preference.entity.ts`

```typescript
@Entity('notification_preferences')
class NotificationPreferenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({ default: true })
  push_enabled: boolean;

  @Column({ default: true })
  email_enabled: boolean;

  @Column({ default: true })
  sms_enabled: boolean;

  @Column({ default: true })
  in_app_enabled: boolean;

  @Column({ default: true })
  order_updates: boolean;

  @Column({ default: true })
  promotions: boolean;

  @Column({ default: true })
  payment_alerts: boolean;

  @Column({ default: true })
  delivery_updates: boolean;
}
```

### Preference Toggle API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/notifications/preferences` | Get user preferences |
| PUT | `/notifications/preferences` | Update preferences |

**Frontend:** `customer-web/src/pages/notifications.tsx` - Toggle switches per channel

## Notification Queue

### Queue Names

**File:** `apps/backend/src/shared/contracts/queues.ts`

```typescript
export const QUEUE_NAMES = {
  NOTIFICATIONS: 'notifications',
  // ... other queues
};
```

### Dispatch Flow

1. **Event Trigger** - Business event (order status change, payment, etc.)
2. **Preference Check** - `NotificationPreferenceService` checks user settings
3. **Entity Creation** - `NotificationEntity` created with status QUEUED
4. **Queue Dispatch** - `QueueService.enqueue(QUEUE_NAMES.NOTIFICATIONS, ...)`
5. **Worker Processing** - BullMQ worker picks job
6. **Channel Delivery**:
   - **Push:** FCM/APNs via notification service
   - **SMS:** Twilio API
   - **Email:** SendGrid/SMTP
7. **Status Update** - Entity status → SENT → DELIVERED or FAILED
8. **Retry on Failure** - Re-queue with backoff

### Webhook Retry Queue

**Entity:** `webhook-retry-queue.entity.ts`

Failed webhooks (not just notifications) use retry queue:
```sql
gateway VARCHAR(50)
event_type VARCHAR(100)
payload JSONB
attempts INTEGER DEFAULT 0
max_attempts INTEGER DEFAULT 5
next_retry_at TIMESTAMP
last_error TEXT
```

## Device Registration

### Endpoint

| Method | Path | Description |
|--------|------|-------------|
| POST | `/devices` | Register device token |
| DELETE | `/devices/:id` | Unregister device |

### Device Registration Entity

**File:** `apps/backend/src/db/entities/user-device.entity.ts`

```sql
user_id UUID REFERENCES users(id)
device_id VARCHAR(255) UNIQUE
device_name VARCHAR(255)
device_type VARCHAR(50) (ios/android/web)
fingerprint VARCHAR(255)
last_seen_at TIMESTAMP
```

Used for:
- Push token mapping
- Multi-device support
- Fraud correlation

## Notification Analytics

### Entity

**File:** `apps/backend/src/db/entities/notification-analytics.entity.ts`

```sql
notification_id UUID REFERENCES notifications(id)
event_type VARCHAR(50) (sent/delivered/opened/clicked)
channel VARCHAR(50)
timestamp TIMESTAMP
metadata JSONB
```

### Metrics Tracked

- Delivery rate per channel
- Open rate
- Click-through rate
- Failure reasons
- Average delivery time

## API Endpoints

### Notification List

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| GET | `/notifications` | JwtAuthGuard | Get user notifications |
| PATCH | `/notifications/:id/read` | JwtAuthGuard | Mark as read |

### Preference Management

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| GET | `/notifications/preferences` | JwtAuthGuard | Get preferences |
| PUT | `/notifications/preferences` | JwtAuthGuard | Update preferences |

### Device Management

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| POST | `/devices` | JwtAuthGuard | Register device |
| DELETE | `/devices/:id` | JwtAuthGuard | Unregister device |

### Queue Management

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| GET | `/notifications/queue/stats` | JwtAuthGuard | Queue statistics |
| POST | `/notifications/queue/retry` | Admin | Retry failed notifications |

## Environment Variables

### Push Notifications

| Variable | Purpose |
|----------|---------|
| `FCM_SERVER_KEY` | Firebase Cloud Messaging server key |
| `APNS_KEY_ID` | Apple Push Notification key ID |
| `APNS_TEAM_ID` | Apple Developer team ID |
| `APNS_BUNDLE_ID` | iOS bundle identifier |

### SMS

| Variable | Purpose |
|----------|---------|
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Sender phone number |

### Email

| Variable | Purpose |
|----------|---------|
| `SMTP_HOST` | SMTP server host |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | Sender email address |
| `SENDGRID_API_KEY` | SendGrid API key (alternative) |

## Rate Limiting

Notifications queue respects:
- BullMQ concurrency limits
- Provider rate limits (Twilio, SendGrid, FCM)
- Retry backoff for failures

## Failure Handling

### Retry Strategy

| Attempt | Delay |
|---------|-------|
| 1 | 1s |
| 2 | 2s |
| 3 | 4s |
| 4 | 8s |
| 5 | 16s |

After max attempts:
- Mark as FAILED
- Alert admin via fallback channel
- Store in webhook_retry_queue for manual retry
