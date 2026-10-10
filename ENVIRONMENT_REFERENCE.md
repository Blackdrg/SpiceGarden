# Environment Reference

**Version:** 1.0.0
**Date:** 2026-06-26
**Classification:** Verified from source code

## Environment Files

| File | Purpose |
|------|---------|
| `.env.example` | Template with all variables documented |
| `.env.staging.example` | Staging overrides |
| `.env.production.example` | Production overrides |
| `apps/backend/.env` | Backend development config |
| `.env` | Root development config |

## Backend Environment Variables

### Application
| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `NODE_ENV` | development | Yes | Environment: development, production, test |
| `PORT` | 3001 | No | Backend HTTP port |
| `SESSION_DURATION_DAYS` | 30 | No | Session expiry in days |
| `REFRESH_TOKEN_LENGTH` | 40 | No | Refresh token character length |

### PostgreSQL
| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `DB_HOST` | localhost | Yes | PostgreSQL host |
| `DB_PORT` | 5432 | No | PostgreSQL port |
| `DB_USER` | spicegarden | Yes | PostgreSQL username |
| `DB_PASS` | - | Yes | PostgreSQL password |
| `DB_NAME` | spicegarden | Yes | PostgreSQL database name |
| `LOCAL_DB` | - | No | Set to 'sqlite' for local SQLite fallback |

### MongoDB
| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `MONGO_URI` | mongodb://localhost:27017/spicegarden | Yes | MongoDB connection string |

### Redis
| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `REDIS_HOST` | localhost | Yes | Redis host |
| `REDIS_PORT` | 6379 | No | Redis port |
| `REDIS_PASSWORD` | - | No | Redis password |
| `REDIS_URL` | - | No | Full Redis URL (overrides host/port) |
| `REDIS_RATE_LIMIT_URL` | - | No | Separate Redis for rate limiting |
| `RATE_LIMIT_REDIS_REQUIRED` | true | No | Require Redis for rate limiting |

### Authentication
| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `JWT_SECRET` | - | Yes | JWT signing secret (32+ chars) |
| `JWT_EXPIRES_IN` | 7d | No | JWT expiration time |
| `ENCRYPTION_SECRET` | - | Yes | AES-256 encryption key (32 chars) |

### CORS
| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `CORS_ALLOWED_ORIGINS` | - | Yes (prod) | Comma-separated allowed origins. No wildcards in production. |

### Stripe Payment
| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `STRIPE_SECRET_KEY` | - | Yes | Stripe secret key (sk_test_* or sk_live_*) |
| `STRIPE_WEBHOOK_SECRET` | - | Yes | Stripe webhook signing secret |
| `PAYMENT_PRIMARY_GATEWAY` | stripe | No | Primary payment gateway |

### Razorpay Payment
| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `RAZORPAY_KEY_ID` | - | Yes | Razorpay key ID (rzp_test_* or rzp_live_*) |
| `RAZORPAY_KEY_SECRET` | - | Yes | Razorpay secret |
| `RAZORPAY_WEBHOOK_SECRET` | - | Yes | Razorpay webhook secret |

### Email (SMTP/SendGrid)
| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `SMTP_HOST` | smtp.sendgrid.net | Yes | SMTP server host |
| `SMTP_PORT` | 587 | No | SMTP server port |
| `SMTP_USER` | apikey | Yes | SMTP username |
| `SMTP_PASS` | - | Yes | SMTP password |
| `SMTP_FROM` | noreply@spicegarden.com | No | From email address |
| `SENDGRID_API_KEY` | - | Yes | SendGrid API key (fallback) |

### SMS (Twilio)
| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `TWILIO_ACCOUNT_SID` | - | Yes | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | - | Yes | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | +15555555555 | No | Twilio phone number |

### Push Notifications
| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `FCM_SERVER_KEY` | - | Yes | Firebase Cloud Messaging server key |
| `FCM_SENDER_ID` | - | No | FCM sender ID |
| `APNS_PRIVATE_KEY` | - | No | APNs private key (iOS) |
| `APNS_KEY_ID` | - | No | APNs key ID |
| `APNS_TEAM_ID` | - | No | APNs team ID |

### External APIs
| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `GOOGLE_MAPS_API_KEY` | - | Yes | Google Maps API key |
| `OPENSEARCH_URL` | https://opensearch:9200 | No | OpenSearch URL |

### Monitoring
| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `SENTRY_DSN` | - | No | Sentry error tracking DSN |
| `SENTRY_ENVIRONMENT` | production | No | Sentry environment label |
| `SENTRY_RELEASE` | 1.0.0 | No | Sentry release version |
| `METRICS_ENABLED` | true | No | Enable Prometheus metrics |

### Security
| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `TRUST_PROXY` | - | No | Trust proxy (0/false/no/off = false) |
| `BODY_SIZE_LIMIT` | 10kb | No | Max request body size |
| `LOAD_TEST_MODE` | - | No | Enable load test mode (disables rate limits) |
| `LOAD_TEST_LIMIT` | 1000000 | No | Rate limit in load test mode |

### WebSocket
| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `WS_MAX_HTTP_BUFFER_SIZE` | 1024 | No | Max WebSocket message size (bytes) |
| `WS_RATE_LIMIT_MAX` | 10 | No | Max WS connections per window |
| `WS_RATE_LIMIT_WINDOW_MS` | 60000 | No | WS rate limit window (ms) |
| `WS_ACK_TIMEOUT_MS` | 5000 | No | WebSocket acknowledgement timeout |

### Rate Limiting
| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `RATE_LIMIT_AUTH_OTP_WINDOW_MS` | 600000 | No | OTP rate limit window (10 min) |
| `RATE_LIMIT_AUTH_OTP_MAX` | 3 | No | OTP max requests |
| `RATE_LIMIT_AUTH_WINDOW_MS` | 900000 | No | Auth rate limit window (15 min) |
| `RATE_LIMIT_AUTH_MAX` | 5 | No | Auth max requests |
| `RATE_LIMIT_ORDERS_WINDOW_MS` | 900000 | No | Orders rate limit window |
| `RATE_LIMIT_ORDERS_MAX` | 10 | No | Orders max requests |
| `RATE_LIMIT_API_WINDOW_MS` | 900000 | No | API rate limit window |
| `RATE_LIMIT_API_MAX` | 100 | No | API max requests |

### Wallet Configuration
| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `WALLET_DEFAULT_CURRENCY` | INR | No | Default wallet currency |
| `WALLET_NOTIFICATION_THRESHOLD` | 100 | No | Low balance notification threshold |
| `WALLET_LOW_BALANCE_THRESHOLD` | 50 | No | Low balance threshold |

### Payment Limits
| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PAYMENT_MAX_SINGLE_AMOUNT` | 10000 | No | Max single payment amount |
| `PAYMENT_DAILY_LIMIT_PER_USER` | 50000 | No | Daily payment limit per user |

## Frontend Environment Variables

### customer-web (`apps/customer-web`)
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL |

### restaurant-dashboard (`apps/restaurant-dashboard`)
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL |

### super-admin (`apps/super-admin`)
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL |

## Production Secrets (Kubernetes)

Production secrets stored in `infra/k8s/secrets.yaml`:
- JWT_SECRET
- ENCRYPTION_SECRET
- DB_HOST, DB_USER, DB_PASS, DB_NAME
- MONGO_URI
- REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
- STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
- RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
- CORS_ALLOWED_ORIGINS
- SENTRY_DSN
- SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM
- TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
- FCM_SERVER_KEY, FCM_SENDER_ID
- GOOGLE_MAPS_API_KEY
- SENDGRID_API_KEY

## Validation

Production environment validation (`apps/backend/src/main.ts:56-86`):
- All critical secrets must be present
- CORS origins cannot contain wildcards
- Missing secrets throw `MissingEnvError`

## Security Notes

1. **NEVER** commit `.env` files to version control
2. **NEVER** use development secrets in production
3. **ALWAYS** use Kubernetes secrets in production
4. **ALWAYS** rotate secrets periodically (use `compliance/secrets-rotate`)
5. **MINIMUM** JWT secret length: 32 characters
6. **MINIMUM** encryption secret length: 32 characters
