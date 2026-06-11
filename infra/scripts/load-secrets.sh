# Load secrets from files for production deployment
# Source this before starting the application
# Usage: source infra/scripts/load-secrets.sh

set -euo pipefail

SECRETS_DIR="${SECRETS_DIR:-./secrets}"

# Load secrets into environment
export JWT_SECRET="$(cat ${SECRETS_DIR}/jwt_secret.txt 2>/dev/null || echo '')"
export ENCRYPTION_SECRET="$(cat ${SECRETS_DIR}/encryption_secret.txt 2>/dev/null || echo '')"
export POSTGRES_PASSWORD="$(cat ${SECRETS_DIR}/db_password.txt 2>/dev/null || echo '')"
export REDIS_PASSWORD="${REDIS_PASSWORD:-}"

echo "Secrets loaded from ${SECRETS_DIR}"
echo "JWT_SECRET: ${JWT_SECRET:0:8}... (${{#JWT_SECRET}} chars)"
echo "ENCRYPTION_SECRET: ${ENCRYPTION_SECRET:0:8}... (${{#ENCRYPTION_SECRET}} chars)"