# SpiceGarden — Known Limitations & Operational Constraints

## 1. Third-Party Provider Credentials
- Live processing of online payments (Stripe, Razorpay), SMS OTP delivery (Twilio), push notifications (FCM/APNs), and emails (SendGrid) requires active, funded third-party merchant accounts and secret injection into `./secrets/production/`.

## 2. Docker Multi-Container Live Orchestration
- Multi-container Docker end-to-end runtime validation is intentionally excluded from the local test scope and is intended to be executed in target staging/production Kubernetes environments.

## 3. Physical Mobile Hardware
- React Native / Expo mobile applications pass all TypeScript type checks and Jest unit tests. Physical device testing (camera permissions, APNs device token registration, background GPS tracking) requires physical Apple and Android devices with associated developer program signing certificates.

## 4. Performance Benchmarks & Disaster Recovery Drills
- Load-testing scripts (k6 suites supporting 1k to 1m simulated users) and disaster recovery automation scripts (`backup.sh`, `restore.sh`) are supplied under `infra/load-tests/` and `infra/scripts/`. Live multi-node staging benchmark qualification and destructive DR restore drills remain pending staging cluster provisioning, as documented in [`PERFORMANCE_VALIDATION.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/docs/commercial/evidence/PERFORMANCE_VALIDATION.md) and [`DR_RESTORE_VALIDATION.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/docs/commercial/evidence/DR_RESTORE_VALIDATION.md).

## 5. gRPC Future Integration
- Packages `@spicegarden/proto` and `@spicegarden/grpc-transport` build and lint cleanly, but are preserved as future extension modules rather than the primary active runtime transport (which uses REST HTTP and Socket.IO WebSockets).
