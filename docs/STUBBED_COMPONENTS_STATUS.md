# Stubbed Components Status

**Generated:** 2026-06-21

## Quarantined or Partial Components

| Component | Status | Notes |
|---|---|---|
| `packages/grpc-transport` | Quarantined | Current source throws `GrpcTransportUnavailableError`; intentionally disabled for production. REST/WebSocket APIs are the recommended path. |
| Mobile geolocation | Implemented (real expo-location) | Uses real `expo-location` API via `apps/delivery-partner/src/services/location.service.ts`. Requires device/emulator for runtime validation. |
| Runtime security/load validation | Blocked (requires running backend) | Scripts exist in `infra/scripts/` but require a running backend on port 3001. |
| Observability metrics/dashboards | Partial | Configs exist in `infra/prometheus/` and `infra/grafana/`. Prometheus target now configured for local dev. |
| Kubernetes deployment | Static-validated | Manifests exist in `infra/k8s/production-hardened.yaml`. No cluster access available for runtime validation. |
| Payment gateway integration | Test-mocked | Payment/webhook tests pass with mocks in `apps/backend/test/payments.module.spec.ts`. No live gateway validation. |

## Deletion Policy

No deletion, archiving, or removal is recommended in this report. Stubbed/partial components should remain present, documented, isolated, or feature-flagged until an explicit approval decision is made.

## Position

Stubbed components are documented and preserved. They are not production-ready runtime capabilities. The primary production path uses REST APIs with the gRPC transport module intentionally quarantined.
