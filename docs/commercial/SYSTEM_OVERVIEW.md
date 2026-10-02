# SpiceGarden — Commercial System Overview

## 1. Executive Summary
SpiceGarden is a modern, enterprise-grade multi-tenant food delivery and restaurant operations SaaS platform. It provides a unified ecosystem encompassing customer ordering, kitchen display and preparation management (KDS), delivery dispatch with real-time GPS tracking, administrative control, and in-app financial ledger capabilities.

## 2. System Components

| Application / Package | Technology Stack | Primary Purpose |
|---|---|---|
| **Backend Core Engine** | NestJS 11, TypeScript, Express, TypeORM, Mongoose, Socket.IO | High-throughput API, authentication, order lifecycle state machine, real-time dispatch, and queue processing. |
| **Customer Web App** | Next.js 15, React 19, Tailwind/CSS | High-performance customer ordering portal with SSR/SSG route generation, cart management, and order tracking. |
| **Restaurant Dashboard** | Next.js 15, React 19 | Vendor portal for menu authoring, order acceptance, pricing management, and Kitchen Display System (KDS). |
| **Super Admin Portal** | Next.js 15, React 19 | Platform administrative oversight, vendor onboarding, analytics, commission/tax reporting, and fleet management. |
| **Customer Mobile App** | React Native, Expo, TypeScript | Native iOS/Android mobile customer application for browsing, ordering, and live delivery tracking. |
| **Delivery Partner App** | React Native, Expo, TypeScript | Driver fulfillment application with shift management, batch dispatch, turn-by-turn routing, and earnings ledger. |
| **Desktop Launcher** | Electron, React 19, Webpack 5 | Cross-platform desktop management application for local service supervision. |
| **Shared Packages** | TypeScript | Shared TypeScript contracts (`@spicegarden/api-types`), UI components (`@spicegarden/ui`), utilities (`@spicegarden/shared`), and gRPC interfaces (`@spicegarden/proto`, `@spicegarden/grpc-transport`). |

## 3. Data Architecture
- **Relational Data (PostgreSQL / TypeORM):** Primary transactional store for users, roles, restaurants, menu hierarchies, orders, order items, wallets, ledger entries, and audit logs.
- **Document Telemetry (MongoDB / Mongoose):** Event log persistence, driver GPS telemetry trails, and unstructured audit records.
- **In-Memory & Queues (Redis / BullMQ):** Session cache, distributed locking, rate-limiting counters, and asynchronous worker queues for notifications and order events.

## 4. Security & Compliance Posture
- Cryptographic password hashing (Argon2 / Bcrypt with unique salts).
- Role-Based Access Control (RBAC) with granular permission decorators.
- Dual-tier rate limiting with Redis backing and in-process memory fallback.
- Parameterized relational queries and NoSQL sanitization.
- Cryptographic HMAC webhook signature validation for Stripe and Razorpay.
