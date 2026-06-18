# README Changelog - Load Testing Updates

## Load Testing Architecture

### Prerequisites
- k6 installed (https://k6.io/docs/getting-started/installation/)
- Node.js with bcrypt package: `npm install bcrypt`

### Quick Start
```bash
# Start load test server
node load-test-server.js

# Run load test
npm run test:load

# Or run with custom parameters
k6 run --vus 100 --duration 60s test/load/10k-users.js
```

### Test Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Simple health check |
| `/auth/register` | POST | Register new user (returns JWT) |
| `/auth/login` | POST | Login existing user (returns JWT) |
| `/orders/health` | GET | Orders service health check |
| `/orders` | POST | Place order (optional auth) |

## Test Methodology

### Test Flow
1. Health check (no auth required)
2. Register user (creates user + returns JWT)
3. Login user (returns JWT)
4. Orders health check
5. Place order (JWT optional in test server)

### Success Criteria
- Success rate: >99%
- p(95) latency: <500ms
- All endpoints reachable

## Verified Results

### Test Configuration
- Script: `test/load/10k-users.js`
- Stages: 100 → 500 → 1000 → 5000 → 10000 users (ramped)
- Duration: 20+ minutes at full load

### Actual Results (100 iterations, 10 VUs test)
- Success rate: 100%
- p(95) latency: 189.83ms
- All checks passed

## Scalability Findings

### Configuration Changes Required
1. **BASE_URL**: Changed from `localhost:3000` to `localhost:3001`
2. **Auth Endpoint**: Changed from `/auth/signup` to `/auth/register`
3. **Required Fields**: Added `phone` to register, `userId` to order payloads
4. **Auth Flow**: Now extracts JWT from login response for order requests

### Infrastructure Requirements for Full Load Test
- PostgreSQL (connection pooling recommended)
- MongoDB
- Redis (for rate limiting and queues)
- Start with: `docker-compose -f compose.dev.yaml up -d`

### Rate Limiting Note
The backend has rate limiting (5 req/15min on `/auth/`) which blocks load test traffic. 
For production testing, either disable rate limiting or use higher limits.