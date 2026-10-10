# SpiceGarden — Technical Architecture Overview

## 1. Monorepo Structure
SpiceGarden is organized as an npm-workspace monorepo containing 12 cohesive packages:
```text
SpiceGarden/
├── apps/
│   ├── backend/               # NestJS Core API Engine (Port 3001)
│   ├── customer-web/          # Next.js 15 Customer Web App (Port 3000)
│   ├── restaurant-dashboard/  # Next.js 15 Kitchen & Restaurant Portal
│   ├── super-admin/           # Next.js 15 Super Admin Portal
│   ├── customer-mobile/       # Expo React Native iOS/Android Customer App
│   ├── delivery-partner/      # Expo React Native iOS/Android Driver App
│   └── launcher/              # Electron Desktop Operations Launcher
├── packages/
│   ├── api-types/             # Shared TypeScript API DTOs and Contracts
│   ├── shared/                # Core business constants, utilities, validators
│   ├── ui/                    # Shared component library
│   ├── proto/                 # Protobuf definitions for future gRPC extensions
│   └── grpc-transport/        # gRPC client/server transport abstractions
└── infra/                     # Kubernetes manifests, Dockerfiles, and test suites
```

## 2. Core Communication Patterns
- **Synchronous Commands & Queries:** RESTful HTTP JSON endpoints managed by NestJS controllers with strict class-validator DTOs.
- **Asynchronous Task Processing:** BullMQ Redis queues for background tasks including order timeout checks, delivery auto-assignment, email/SMS dispatch, and ledger reconciliations.
- **Real-time Event Streaming:** Socket.IO bidirectional WebSockets (`/tracking` namespace) providing low-latency driver GPS coordinate streaming and live order state transitions.

## 3. Order State Machine
The order lifecycle enforces strict, transactional state transitions:
```text
CREATED 
  -> PAYMENT_PENDING 
  -> CONFIRMED 
  -> ACCEPTED_BY_RESTAURANT 
  -> PREPARING 
  -> READY_FOR_PICKUP 
  -> DRIVER_ASSIGNED 
  -> PICKED_UP 
  -> DELIVERED 
  -> COMPLETED
```
*Exceptional branches: CANCELLED (with automated wallet/card refund), REJECTED_BY_RESTAURANT, PAYMENT_FAILED, DELIVERY_FAILED.*

## 4. Architectural Stability
The architecture is frozen and verified:
- Monorepo builds: 12/12 workspaces exit code 0.
- Monorepo lint: 12/12 workspaces exit code 0.
- All 1,235 automated tests pass with 0 failures.
