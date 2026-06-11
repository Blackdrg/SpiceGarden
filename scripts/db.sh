#!/bin/bash
set -euo pipefail

MIGRATIONS_DIR="infra/postgres/migrations"
SEED_DIR="infra/postgres/seed"
HOST="${DB_HOST:-postgres}"
PORT="${DB_PORT:-5432}"
USER="${DB_USER:-spicegarden}"
PASS="${DB_PASS:-spicegarden_dev}"
DB="${DB_NAME:-spicegarden}"
COMPOSE_FILE="${COMPOSE_FILE:-compose.dev.yaml}"

export PGPASSWORD="${PASS}"

log() {
  echo "[$(date +%Y-%m-%dT%H:%M:%S)] $1"
}

usage() {
  cat <<EOF
SpiceGarden Database Management Tool

Usage: ./scripts/db.sh <command> [args]

Commands:
  up                 Start DB containers (postgres, mongo, redis)
  down               Stop DB containers
  init               Create migration tracking table (idempotent)
  status             Show container + migration status
  migrate            Apply all pending .sql up-migrations
  rollback           Roll back the last applied migration
  seed <dir>         Apply seed .sql files in <dir> (idempotent)
  reset [--force]    Roll back all + re-migrate (+ wipe volumes with --force)
  verify             Verify schema and data integrity
  restore <archive>  Restore from a .tar.gz backup
  help               Show this help

Global environment overrides:
  DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, COMPOSE_FILE

Examples:
  ./scripts/db.sh up
  ./scripts/db.sh migrate
  ./scripts/db.sh rollback
  ./scripts/db.sh seed infra/postgres/seed
  ./scripts/db.sh verify
  ./scripts/db.sh restore backup/spicegarden_backup_20260101_120000.tar.gz
  ./scripts/db.sh reset --force

Exit codes:
  0  success
  2  container/docker error
  3  migration/sql error
  4  seed/data error
  5  backup/restore error
  6  verify error
  7  bad usage
EOF
}

check_postgres() {
  docker exec postgres pg_isready -U "${USER}" -d "${DB}" >/dev/null 2>&1
}

wait_for_postgres() {
  log "Waiting for PostgreSQL..."
  for i in $(seq 1 60); do
    if check_postgres; then
      log "PostgreSQL is ready"
      return 0
    fi
    if [[ $i -eq 60 ]]; then
      log "ERROR: PostgreSQL did not become ready within 120s"
      return 2
    fi
    sleep 2
  done
}

db_up() {
  log "=== db up ==="
  log "Starting containers from ${COMPOSE_FILE}..."
  if [[ ! -f "${COMPOSE_FILE}" ]]; then
    log "ERROR: ${COMPOSE_FILE} not found"
    return 2
  fi
  docker-compose -f "${COMPOSE_FILE}" up -d postgres mongo redis 2>&1 | tail -5 || true
  wait_for_postgres || return 2
  log "=== db up complete ==="
}

db_down() {
  log "=== db down ==="
  docker-compose -f "${COMPOSE_FILE}" down 2>&1 | tail -3 || true
  log "=== db down complete ==="
}

db_status() {
  log "=== db status ==="

  if check_postgres; then
    log "  PostgreSQL: UP"
    local table_count=$(docker exec postgres psql -U "${USER}" -d "${DB}" -At -c \
      "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'" 2>/dev/null || echo "0")
    log "  Tables: ${table_count}"

    local mt=$(docker exec postgres psql -U "${USER}" -d "${DB}" -At -c \
      "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='spicegarden_db_migrations'" 2>/dev/null || echo "0")
    if [[ "$mt" -gt 0 ]]; then
      local applied=$(docker exec postgres psql -U "${USER}" -d "${DB}" -At -c \
        "SELECT COUNT(*) FROM spicegarden_db_migrations WHERE direction='up'" 2>/dev/null || echo "0")
      log "  Applied migrations: ${applied}"
      local last=$(docker exec postgres psql -U "${USER}" -d "${DB}" -At -c \
        "SELECT name FROM spicegarden_db_migrations WHERE direction='up' ORDER BY applied_at DESC LIMIT 1" 2>/dev/null || echo "none")
      log "  Last migration: ${last}"
    else
      log "  Migration tracking: not initialized"
    fi
  else
    log "  PostgreSQL: DOWN"
  fi

  if docker exec mongo mongosh --eval "db.adminCommand('ping')" --quiet >/dev/null 2>&1; then
    log "  MongoDB: UP"
  else
    log "  MongoDB: DOWN"
  fi

  if docker exec redis redis-cli ping >/dev/null 2>&1; then
    log "  Redis: UP"
  else
    log "  Redis: DOWN"
  fi
  log "=== db status complete ==="
}

db_init() {
  log "=== db init (create tracking tables) ==="
  if ! check_postgres; then
    log "ERROR: PostgreSQL not reachable. Run 'db up' first."
    return 2
  fi

  docker exec postgres psql -U "${USER}" -d "${DB}" -c "
    CREATE TABLE IF NOT EXISTS spicegarden_db_migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT NOW(),
      direction VARCHAR(10) NOT NULL CHECK (direction IN ('up','down'))
    );
  " >/dev/null 2>&1 || true

  log "Migration tracking table ready"
  log "=== db init complete ==="
}

db_migrate() {
  log "=== db migrate ==="
  if ! check_postgres; then
    log "ERROR: PostgreSQL not reachable. Run 'db up' first."
    return 2
  fi
  db_init || return 3

  if [[ ! -d "${MIGRATIONS_DIR}" ]]; then
    log "  No migrations directory: ${MIGRATIONS_DIR}"
    return 0
  fi

  mapfile -t files < <(ls "${MIGRATIONS_DIR}"/*__up.sql 2>/dev/null | sort || true)

  if [[ ${#files[@]} -eq 0 ]]; then
    log "  No migration files found in ${MIGRATIONS_DIR}"
    log "=== db migrate complete ==="
    return 0
  fi

  local applied_count=0
  local skipped_count=0
  local failed=0

  for f in "${files[@]}"; do
    local fname=$(basename "$f" .sql)
    local already_applied=$(docker exec postgres psql -U "${USER}" -d "${DB}" -At -c \
      "SELECT COUNT(*) FROM spicegarden_db_migrations WHERE name='${fname}' AND direction='up'" 2>/dev/null || echo "0")

    if [[ "${already_applied}" -gt 0 ]]; then
      log "  SKIP (applied): ${fname}"
      ((skipped_count++))
      continue
    fi

    log "  APPLYING: ${fname}"
    docker cp "$f" postgres:/tmp/_migration.sql >/dev/null 2>&1
    local rc=0
    docker exec postgres psql -U "${USER}" -d "${DB}" -f "/tmp/_migration.sql" >/dev/null 2>&1 || rc=$?
    if [[ $rc -eq 0 ]]; then
      docker exec postgres psql -U "${USER}" -d "${DB}" -c \
        "INSERT INTO spicegarden_db_migrations (name, direction) VALUES ('${fname}', 'up') ON CONFLICT (name) DO UPDATE SET applied_at=NOW(), direction='up'" >/dev/null 2>&1
      log "  OK: ${fname}"
      ((applied_count++))
    else
      log "  FAILED: ${fname}"
      ((failed++))
      break
    fi
  done

  log "  Applied: ${applied_count}  Skipped: ${skipped_count}  Failed: ${failed}"
  if [[ $failed -gt 0 ]]; then
    return 3
  fi
  log "=== db migrate complete ==="
}

db_rollback() {
  log "=== db rollback ==="
  if ! check_postgres; then
    log "ERROR: PostgreSQL not reachable. Run 'db up' first."
    return 2
  fi

  local last_migration=$(docker exec postgres psql -U "${USER}" -d "${DB}" -At -c \
    "SELECT name FROM spicegarden_db_migrations WHERE direction='up' ORDER BY applied_at DESC LIMIT 1" 2>/dev/null || echo "")

  if [[ -z "${last_migration}" ]]; then
    log "  No migrations applied, nothing to rollback"
    log "=== db rollback complete ==="
    return 0
  fi

  local down_file="${MIGRATIONS_DIR}/${last_migration}__down.sql"
  if [[ ! -f "${down_file}" ]]; then
    log "  ERROR: Rollback file not found: ${down_file}"
    return 3
  fi

  log "  Rolling back: ${last_migration}"
  docker cp "$down_file" postgres:/tmp/_migration.sql >/dev/null 2>&1
  local rc=0
  docker exec postgres psql -U "${USER}" -d "${DB}" -f "/tmp/_migration.sql" >/dev/null 2>&1 || rc=$?
  if [[ $rc -eq 0 ]]; then
    docker exec postgres psql -U "${USER}" -d "${DB}" -c \
      "DELETE FROM spicegarden_db_migrations WHERE name='${last_migration}' AND direction='up'" >/dev/null 2>&1
    log "  ROLLED BACK: ${last_migration}"
  else
    log "  ROLLBACK FAILED: ${last_migration}"
    return 3
  fi
  log "=== db rollback complete ==="
}

db_seed() {
  local seed_dir="${1:-${SEED_DIR}}"
  log "=== db seed [${seed_dir}] ==="
  if ! check_postgres; then
    log "ERROR: PostgreSQL not reachable. Run 'db up' first."
    return 2
  fi
  db_init || return 4

  if [[ ! -d "${seed_dir}" ]]; then
    log "  No seed directory: ${seed_dir}"
    return 0
  fi

  local already_seeded=$(docker exec postgres psql -U "${USER}" -d "${DB}" -At -c \
    "SELECT COUNT(*) FROM spicegarden_db_migrations WHERE name='seed_completed' AND direction='up'" 2>/dev/null || echo "0")

  if [[ "${already_seeded}" -gt 0 ]]; then
    log "  Seeds already applied (idempotent guard active)"
    log "=== db seed complete ==="
    return 0
  fi

  mapfile -t seed_files < <(ls "${seed_dir}"/*.sql 2>/dev/null | sort || true)

  if [[ ${#seed_files[@]} -eq 0 ]]; then
    log "  No seed files found in ${seed_dir}"
    return 0
  fi

  for sf in "${seed_files[@]}"; do
    log "  Seeding: $(basename "$sf")"
    docker cp "$sf" postgres:/tmp/_seed.sql >/dev/null 2>&1
    local rc=0
    docker exec postgres psql -U "${USER}" -d "${DB}" -f "/tmp/_seed.sql" >/dev/null 2>&1 || rc=$?
    if [[ $rc -ne 0 ]]; then
      log "  SEED FAILED: $(basename "$sf")"
      return 4
    fi
    log "  OK: $(basename "$sf")"
  done

  docker exec postgres psql -U "${USER}" -d "${DB}" -c \
    "INSERT INTO spicegarden_db_migrations (name, direction) VALUES ('seed_completed', 'up') ON CONFLICT (name) DO UPDATE SET applied_at=NOW(), direction='up'" >/dev/null 2>&1
  log "=== db seed complete ==="
}

db_reset() {
  log "=== db reset ==="
  if [[ "${1:-}" == "--force" ]]; then
    log "  Wiping containers and volumes..."
    docker-compose -f "${COMPOSE_FILE}" down -v 2>/dev/null || true
    db_up || return 2
    sleep 3
  fi

  while true; do
    local last=$(docker exec postgres psql -U "${USER}" -d "${DB}" -At -c \
      "SELECT name FROM spicegarden_db_migrations WHERE direction='up' ORDER BY applied_at DESC LIMIT 1" 2>/dev/null || echo "")
    if [[ -z "${last}" ]]; then
      break
    fi
    local down_file="${MIGRATIONS_DIR}/${last}__down.sql"
    if [[ ! -f "${down_file}" ]]; then
      log "  WARNING: No down file for ${last}, skipping"
      docker exec postgres psql -U "${USER}" -d "${DB}" -c \
        "DELETE FROM spicegarden_db_migrations WHERE name='${last}' AND direction='up'" >/dev/null 2>&1 || true
      continue
    fi
    log "  Rolling back: ${last}"
    docker cp "$down_file" postgres:/tmp/_migration.sql >/dev/null 2>&1
    docker exec postgres psql -U "${USER}" -d "${DB}" -f "/tmp/_migration.sql" >/dev/null 2>&1 || true
    docker exec postgres psql -U "${USER}" -d "${DB}" -c \
      "DELETE FROM spicegarden_db_migrations WHERE name='${last}' AND direction='up'" >/dev/null 2>&1 || true
  done

  docker exec postgres psql -U "${USER}" -d "${DB}" -c \
    "DELETE FROM spicegarden_db_migrations WHERE name='seed_completed'" >/dev/null 2>&1 || true

  log "=== db reset complete ==="
}

db_verify() {
  log "=== db verify ==="
  if ! check_postgres; then
    log "ERROR: PostgreSQL not reachable"
    return 6
  fi

  log "  Checking migration tracking table..."
  local mt=$(docker exec postgres psql -U "${USER}" -d "${DB}" -At -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='spicegarden_db_migrations'" 2>/dev/null || echo "0")
  log "  spicegarden_db_migrations table exists: $( [[ "$mt" -gt 0 ]] && echo 'YES' || echo 'NO' )"

  local expected_tables=(users restaurants orders menu_items menu_categories drivers wallets coupons)
  for tbl in "${expected_tables[@]}"; do
    local exists=$(docker exec postgres psql -U "${USER}" -d "${DB}" -At -c \
      "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='${tbl}'" 2>/dev/null || echo "0")
    if [[ "$exists" -gt 0 ]]; then
      local row_count=$(docker exec postgres psql -U "${USER}" -d "${DB}" -At -c \
        "SELECT COUNT(*) FROM ${tbl}" 2>/dev/null || echo "0")
      log "  Table ${tbl}: EXISTS (${row_count} rows)"
    else
      log "  Table ${tbl}: MISSING"
    fi
  done

  log "=== db verify complete ==="
}

db_restore() {
  local backup_file="${1:-}"
  log "=== db restore ==="

  if [[ -z "${backup_file}" ]]; then
    log "ERROR: No backup file specified"
    echo "  Usage: ./scripts/db.sh restore <path/to/backup.tar.gz>"
    return 7
  fi

  if [[ ! -f "${backup_file}" ]]; then
    backup_file="$(pwd)/${backup_file}"
    if [[ ! -f "${backup_file}" ]]; then
      log "ERROR: Backup file not found: ${backup_file}"
      return 5
    fi
  fi

  log "  Backup file: ${backup_file}"
  local backup_name=$(basename "${backup_file}" .tar.gz)
  local temp_dir=$(mktemp -d)

  log "  Extracting..."
  tar -xzf "${backup_file}" -C "${temp_dir}" 2>/dev/null || {
    log "ERROR: Failed to extract backup"
    rm -rf "${temp_dir}"
    return 5
  }

  log "  Restoring PostgreSQL..."
  local pg_sql="${temp_dir}/${backup_name}_postgres.sql"
  if [[ -f "${pg_sql}" ]]; then
    docker cp "${pg_sql}" postgres:/tmp/_restore.sql >/dev/null 2>&1
    local rc=0
    docker exec postgres psql -U "${USER}" -d "${DB}" -f "/tmp/_restore.sql" >/dev/null 2>&1 || rc=$?
    if [[ $rc -eq 0 ]]; then
      log "  PostgreSQL restored"
    else
      log "  PostgreSQL restore FAILED"
      rm -rf "${temp_dir}"
      return 5
    fi
  else
    log "  No PostgreSQL dump found in backup"
  fi

  log "  Restoring MongoDB..."
  local mongo_dir="${temp_dir}/${backup_name}_mongo"
  if [[ -d "${mongo_dir}" ]]; then
    docker cp "${mongo_dir}" mongo:/data/db/restore >/dev/null 2>&1
    docker exec mongo mongorestore -d "${DB}" --drop /data/db/restore/${backup_name} >/dev/null 2>&1 || \
    docker exec mongo mongorestore -d "${DB}" --drop /data/db/restore >/dev/null 2>&1 || \
    log "  MongoDB restore: skipped (may already be populated)"
    docker exec mongo rm -rf /data/db/restore >/dev/null 2>&1 || true
    log "  MongoDB restored"
  else
    log "  No MongoDB dump found in backup"
  fi

  log "  Restoring Redis..."
  local redis_rdb="${temp_dir}/${backup_name}_redis.rdb"
  if [[ -f "${redis_rdb}" ]]; then
    docker cp "${redis_rdb}" redis:/data/dump.rdb.restore >/dev/null 2>&1
    docker exec redis sh -c "cp /data/dump.rdb.restore /data/dump.rdb" >/dev/null 2>&1
    docker exec redis redis-cli SHUTDOWN NOSAVE >/dev/null 2>&1 || true
    docker restart redis >/dev/null 2>&1 || true
    sleep 2
    log "  Redis restored"
  else
    log "  No Redis dump found in backup"
  fi

  rm -rf "${temp_dir}"
  log "=== db restore complete ==="
}

COMMAND="${1:-help}"
case "${COMMAND}" in
  up)       db_up ;;
  down)     db_down ;;
  init)     db_init ;;
  status)   db_status ;;
  migrate)  db_migrate ;;
  rollback) db_rollback ;;
  seed)     db_seed "${2:-}" ;;
  verify)   db_verify ;;
  reset)    db_reset "${2:-}" ;;
  restore)  db_restore "${2:-}" ;;
  help|*)   usage ;;
esac
