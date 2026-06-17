# Load Test Report

Generated: 2026-06-17T11:50+05:30  
Branch: `feat/add-react-doctor`

## Executive summary

Load testing is not complete. The 10k-user backend load script fails before producing load metrics because it redeclares a built-in k6 metric.

## Attempted command

| Command | Result |
| :--- | :--- |
| `npm run test:load --workspace @spicegarden/backend` | Exit `107` |

## Failure

```text
GoError: metric 'http_req_duration' already exists but with a value type time, instead of default
at apps/backend/test/load/10k-users.js:6:27
```

The script currently defines:

```js
const http_req_duration = new Trend('http_req_duration');
```

k6 already provides `http_req_duration` as a built-in trend metric, so the script should use the built-in metric or rename the custom metric.

## Current status

Load testing remains a release blocker. No 10k-user, 20k-user, breaking-point, Docker/compose validation, Kubernetes validation, or staging deployment validation has been completed in this pass.

## Required next step

Fix `apps/backend/test/load/10k-users.js` to avoid redeclaring `http_req_duration`, then rerun:

```bash
npm run test:load --workspace @spicegarden/backend
```
