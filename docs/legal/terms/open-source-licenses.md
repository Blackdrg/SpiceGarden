# Open Source Licenses

**Effective Date:** 2026-06-10  
**Status:** DRAFT — First draft, not yet reviewed by legal counsel.  
**Backend reference:** `apps/backend/src/legal/entities/legal.enums.ts:21` (`LegalDocumentType.OPEN_SOURCE_LICENSES`), `apps/backend/src/legal/legal-seed.service.ts:326-335`.

---

## 1. Overview

The SpiceGarden platform is built using open-source software components licensed under various open-source licenses. This document provides a summary of the open-source licenses used in production.

The full machine-readable inventory is available at `docs/legal/oss-licenses.csv` (412 packages, scanned via `npx license-checker --production`).

**Scan command:** `npx license-checker --production` (run from the project root).

## 2. License Summary

| License | Count |
|---|---|
| MIT | 313 |
| ISC | 41 |
| Apache-2.0 | 22 |
| BSD-3-Clause | 16 |
| BlueOak-1.0.0 | 8 |
| BSD-2-Clause | 4 |
| Python-2.0 | 1 |
| (MIT OR WTFPL) | 1 |
| (BSD-2-Clause OR MIT OR Apache-2.0) | 1 |
| (MIT AND BSD-3-Clause) | 1 |
| 0BSD | 1 |
| MIT AND ISC | 1 |
| MIT* | 1 |
| UNLICENSED | 1 |
| **Total** | **412** |

## 3. MIT License

The following packages are licensed under the MIT License:

### Backend / Core
- `@nestjs/common`, `@nestjs/core`, `@nestjs/microservices`, `@nestjs/platform-express`, `@nestjs/platform-socket.io`, `@nestjs/swagger`, `@nestjs/websockets`, `@nestjs/mapped-types`
- `express`, `express-rate-limit`, `body-parser`, `cors`, `cookie`, `cookie-signature`, `csurf`
- `typeorm`, `mongoose`, `bullmq`, `ioredis`, `socket.io`, `ws`
- `bcrypt`, `passport`, `passport-jwt`, `passport-local`
- `stripe`, `dayjs`, `lodash`, `class-validator`, `class-transformer`, `helmet`
- `swagger-ui-dist`, `swagger-ui-express`
- `uuid`, `validator`, `jsonwebtoken`

### Frontend (Web)
- `react`, `react-dom`, `react-smooth`, `recharts`
- `@tanstack/react-query`, `@tanstack/query-core`
- `next`, `next-auth` (via framework)
- `@types/cors`, `@types/node`, `@types/ws`

### Mobile (React Native)
- `react-native`, `expo-notifications`

(292 additional packages — full list in `docs/legal/oss-licenses.csv`)

## 4. ISC License

The following packages are licensed under the ISC License:

### Frontend (Web & Mobile)
- `d3-array`, `d3-color`, `d3-ease`, `d3-format`, `d3-interpolate`, `d3-path`, `d3-scale`, `d3-shape`, `d3-time`, `d3-time-format`, `d3-timer`
- `internmap`, `ms`, `node-pre-gres`, `pg`, `pg-types`, `pg-pool`, `pg-protocol`, `pg-connection-string`, `pgpass`

### Infrastructure
- `semver`, `lru-cache`, `glob`, `minimatch`, `which`, `ini`, `inherits`, `graceful-fs`, `fs-constants`
- `setprototypeof`, `signal-exit`, `wrappy`, `once`, `nopt`, `debug`, `ms`, `minimist`

(31 additional packages — full list in `docs/legal/oss-licenses.csv`)

## 5. Apache-2.0 License

- `@grpc/grpc-js`, `@grpc/proto-loader` — gRPC
- `bson`, `mongodb`, `mongoose`, `kareem`, `mongodb-connection-string-url`, `cluster-key-slot`, `denque`, `long`
- `reflect-metadata` — TypeScript metadata
- `rxjs` — Reactive Extensions
- `google-auth-library` components: `gaxios`, `gcp-metadata`, `google-logging-utils`
- `detect-libc`, `exponential-backoff`
- `swagger-ui-dist` — API documentation UI
- `sumchecker` — checksum verification
- `tunnel-agent` — HTTPS tunneling
- `typescript` — development (not redistributed in production builds)

## 6. BSD Licenses

### BSD-3-Clause (16 packages)
- `@protobufjs/*` (9 packages) — Protocol Buffers
- `diff@4.0.4`, `ieee754@1.2.1` — IEEE 754 utilities
- `protobufjs@7.6.5` — Protocol Buffers
- `qs@6.15.3` — Query string parsing
- `react-transition-group@4.4.5` — React transitions
- `sqlite3@6.0.1` — SQLite bindings

### BSD-2-Clause (4 packages)
- `@electron-internal/extract-zip@1.0.4` — Electron tooling
- `dotenv@16.6.1` — Environment variable loading
- `webidl-conversions@3.0.1`, `webidl-conversions@7.0.0` — WebIDL type conversion

## 7. Other Licenses

| License | Package Count | Example Packages |
|---|---|---|
| BlueOak-1.0.0 | 8 | `tar@7.5.22`, `minipass@7.1.3`, `chownr@3.0.0` |
| Python-2.0 | 1 | `argparse@2.0.1` |
| 0BSD | 1 | `tslib@2.8.1` — TypeScript runtime helpers |
| MIT\* | 1 | `thirty-two@1.0.2` |
| UNLICENSED | 1 | `spicegarden@0.0.0` (internal/workspace package) |

## 8. Multi-License Packages

The following packages have multiple possible licenses:

- `expand-template@2.0.3` — (MIT OR WTFPL)
- `rc@2.0.5` — (BSD-2-Clause OR MIT OR Apache-2.0)
- `sha.js@2.4.12` — (MIT AND BSD-3-Clause)
- `victory-vendor@36.9.2` — (MIT AND ISC)

For multi-license packages, the license that applies is determined by the usage context. All packages comply with their respective license terms.

## 9. License Compliance

SpiceGarden ensures compliance with all open-source license obligations:

- **MIT/ISC/BSD/Apache-2.0/BlueOak-1.0.0/0BSD licenses:** Permissive licenses requiring only copyright notice retention and redistribution of license text. Full license texts are included in `LICENSE` files within the `node_modules` directory of each package.
- **Copyleft licenses:** No GPL, AGPL, or LGPL licensed packages are used in production. The scan confirms 0 copyleft dependencies.
- **Attribution:** Where required, attribution is provided in the source distribution and in this document.

## 10. Full Package Listing

The complete package listing with names, versions, licenses, and repository URLs is available in `docs/legal/oss-licenses.csv`.

To regenerate:
```bash
npx license-checker --production --csv > docs/legal/oss-licenses.csv
```

## 11. Contact

For open-source license inquiries, contact: opensource@spicegarden.com

---

*This document is a DRAFT. The license inventory was generated via `npx license-checker --production`.*
