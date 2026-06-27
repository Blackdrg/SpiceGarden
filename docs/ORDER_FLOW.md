# Order Flow

## Order State Machine

### OrderStatus Enum

Defined in `apps/backend/src/shared/domain/order.interface.ts:22-35`:

```
PLACED → PAYMENT_CONFIRMED → RESTAURANT_ACCEPTED → PREPARING → READY → READY_FOR_PICKUP → DRIVER_ASSIGNED → PICKED_UP → ON_THE_WAY → DELIVERED
                                                              ↘ CANCELLED ↗
```

**States:**
- `PLACED` - Order placed, awaiting payment
- `PAYMENT_CONFIRMED` - Payment successful
- `RESTAURANT_ACCEPTED` - Restaurant accepted order
- `PREPARING` - Kitchen preparing
- `READY` - Ready for pickup
- `READY_FOR_PICKUP` - Ready, awaiting driver
- `DRIVER_ASSIGNED` - Driver assigned
- `PICKED_UP` - Driver picked up order
- `ON_THE_WAY` - In transit
- `DELIVERED` - Delivered to customer
- `CANCELLED` - Order cancelled
- `BATCHED` - Part of batch processing

### PaymentStatus Enum

Defined in `apps/backend/src/shared/domain/order.interface.ts:37-42`:

- `PENDING` - Awaiting payment
- `COMPLETED` - Payment successful
- `FAILED` - Payment failed
- `REFUNDED` - Payment refunded

### Transition Rules

Source: `apps/backend/src/services/order/order.service.ts:96-100`

```typescript
canTransitionOrderStatus(from: OrderStatus, to: OrderStatus): boolean {
  const allowedTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
    [OrderStatus.PLACED]: [OrderStatus.PAYMENT_CONFIRMED, OrderStatus.RESTAURANT_ACCEPTED, OrderStatus.CANCELLED],
    [OrderStatus.PAYMENT_CONFIRMED]: [OrderStatus.RESTAURANT_ACCEPTED, OrderStatus.CANCELLED],
    [OrderStatus.RESTAURANT_ACCEPTED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
    [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
    // ... additional states
  };
}
```

## Order Creation Flow

1. **Customer places order** via customer-web or mobile
2. **OrderService.createOrder()** validates items and totals
3. **PaymentService.createPaymentIntent()** creates Stripe/Razorpay intent
4. **IdempotencyService** ensures no duplicate payment intents
5. **OrderEntity** saved with `PLACED` status
6. **QueueService.enqueueOrderLifecycle()** queues order state transition
7. **Webhook** from payment gateway confirms payment
8. **Order status** updated to `PAYMENT_CONFIRMED`
9. **NotificationService** sends push/SMS/email to customer and restaurant

## Payment Flow

1. **Customer selects payment method** (card/UPI/COD/wallet)
2. **PaymentsController.createPaymentIntent()** validates fraud
3. **RetryService** wraps gateway call with exponential backoff
4. **IdempotencyService** checks for existing intent
5. **GatewayFactory** routes to Stripe/Razorpay/COD
6. **WebhookController** handles payment confirmation
7. **OrderService** updates order status
8. **QueueService** triggers notification dispatch

## Delivery Assignment Flow

1. **Order confirmed** → `DRIVER_ASSIGNED` status
2. **DriverAssignmentService** finds nearest available driver
3. **ETAIntelligenceService** calculates delivery time
4. **Socket.IO** broadcasts to driver namespace
5. **Driver accepts/rejects** via delivery-partner app
6. **Order status** → `PICKED_UP` → `ON_THE_WAY`
7. **Customer** receives real-time tracking updates via Socket.IO
8. **OTP verification** at pickup and delivery
9. **Order status** → `DELIVERED`
10. **WalletService** credits driver earnings

## Kitchen (KDS) Flow

1. **OrderPlaced** → Kitchen Display receives via Socket.IO
2. **Kitchen staff acknowledge** → status `RESTAURANT_ACCEPTED`
3. **Preparation starts** → status `PREPARING`
4. **Ready for pickup** → status `READY`
5. **Batch mode** allows grouping orders by status
6. **Audio alerts** for new orders (base64-encoded WAV)
7. **Inventory updates** via stock level management

## Refund Flow

1. **Customer requests refund** or admin initiates
2. **RefundService** creates RefundEntity
3. **RefundApprovalEntity** requires approver (admin/finance)
4. **PaymentService** processes refund via gateway
5. **WalletService** updates wallet balance if applicable
6. **NotificationService** notifies customer

## Queue Processing

### BullMQ Queue Jobs

**Queue Names:**
- `order_lifecycle` - Order state machine transitions
- `driver_assignment` - Driver matching
- `notifications` - Notification dispatch
- `refunds` - Refund processing
- `analytics` - Analytics aggregation

**Job Pattern:**
```typescript
enqueueOrderLifecycle({
  orderId: string,
  status: OrderStatus,
  userId?: string
})
```

**Retry Configuration:**
- Attempts: 3
- Backoff: Exponential, base delay 1000ms
- Remove complete: 86400s age or 1000 count
- Remove failed: 86400s age or 1000 count

## Notification Flow

1. **Event triggered** (order status change, payment success, etc.)
2. **NotificationService** determines channels (push/SMS/email/in-app)
3. **Notification preference check** via `NotificationPreferenceEntity`
4. **QueueService.enqueue(QUEUE_NAMES.NOTIFICATIONS, ...)** dispatches job
5. **Worker** processes based on channel:
   - **Push:** FCM/APNs via expo-notifications or Firebase
   - **SMS:** Twilio
   - **Email:** SendGrid/SMTP
6. **NotificationEntity** status updated (QUEUED → SENT → DELIVERED)
7. **Failure** → retry via webhook-retry queue or mark FAILED

## Loyalty Flow

1. **Customer views coupons** - `loyalty.controller.ts` lists available
2. **Coupon applied** at checkout - validated by coupon usage tracking
3. **Referral code shared** - creates ReferralEntity
4. **Cashback processed** - WalletService credits wallet
5. **Points/credits tracked** via coupon usage entity
