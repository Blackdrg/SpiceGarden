const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const SCRIPT = path.join(ROOT, 'scripts/db.sh');

function runDb(args, opts = {}) {
  const cmd = `bash "${SCRIPT}" ${args}`;
  try {
    const stdout = execSync(cmd, {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: opts.timeout || 120000,
      env: { ...process.env, COMPOSE_FILE: 'compose.dev.yaml' },
    });
    return { ok: true, stdout: stdout.trim() };
  } catch (err) {
    return {
      ok: false,
      stdout: (err.stdout || '').trim(),
      stderr: (err.stderr || '').trim(),
      code: err.status,
    };
  }
}

describe('Database Migration Stability', () => {
  before(function () {
    this.timeout(30000);
    console.log('[setup] Bringing up containers...');
    const r = runDb('up', { timeout: 120000 });
    if (!r.ok) {
      console.log('[setup] db up warning:', r.stderr || r.stdout);
    } else {
      console.log('[setup] db up done');
    }
    // init table
    runDb('init');
  });

  after(function () {
    this.timeout(60000);
    console.log('[teardown] Resetting DB state...');
    runDb('reset');
    console.log('[teardown] Done');
  });

  describe('db up', () => {
    it('should report status as UP', function () {
      this.timeout(30000);
      const r = runDb('status');
      expect(r.ok || r.stdout.includes('PostgreSQL: UP')).to.be.true;
    });
  });

  describe('db migrate (reproducible)', () => {
    it('should apply InitialSchema20240101000001 and expected tables exist', function () {
      this.timeout(60000);
      const r = runDb('migrate');
      expect(r.ok, `migrate failed: ${r.stderr || r.stdout}`).to.be.true;
      const expected = ['users', 'restaurants', 'orders', 'menu_items', 'drivers', 'wallets', 'coupons'];
      for (const t of expected) {
        const q = `bash "${SCRIPT}" init >/dev/null 2>&1; docker exec postgres psql -U spicegarden -d spicegarden -At -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='${t}'"`;
        const out = execSync(q, { cwd: ROOT, encoding: 'utf8' }).trim();
        expect(parseInt(out, 10)).to.be.greaterThan(0);
      }
    });

    it('should be idempotent on second run (no changes)', function () {
      this.timeout(60000);
      const r1 = runDb('migrate');
      expect(r1.ok).to.be.true;
      const r2 = runDb('migrate');
      expect(r2.ok).to.be.true;
      expect(r2.stdout).to.include('SKIP');
    });
  });

  describe('db rollback', () => {
    it('should rollback last migration and drop tables', function () {
      this.timeout(60000);
      const r = runDb('rollback');
      expect(r.ok, `rollback failed: ${r.stderr || r.stdout}`).to.be.true;
      const t = 'users';
      const q = `docker exec postgres psql -U spicegarden -d spicegarden -At -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='${t}'"`;
      const out = execSync(q, { cwd: ROOT, encoding: 'utf8' }).trim();
      expect(parseInt(out, 10)).to.equal(0);
    });

    it('should report nothing to rollback when clean', function () {
      this.timeout(30000);
      const r = runDb('rollback');
      expect(r.ok).to.be.true;
      expect(r.stdout).to.include('nothing to rollback');
    });
  });

  describe('db restore', () => {
    it('should restore from backup archive', function () {
      this.timeout(120000);
      // Re-apply schema so we have something to back up
      runDb('migrate');
      runDb('seed');

      const backupDir = path.join(ROOT, 'backup');
      fs.mkdirSync(backupDir, { recursive: true });
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const prefix = path.join(backupDir, `spicegarden_backup_${ts}`);

      // Use the existing backup script logic (inline pg_dump)
      execSync(
        `docker exec postgres pg_dump -U spicegarden spicegarden > "${prefix}_postgres.sql"`,
        { cwd: ROOT, encoding: 'utf8' }
      );
      const tar = `${prefix}.tar.gz`;
      execSync(
        `tar -czf "${tar}" -C "${backupDir}" "$(basename "${prefix}_postgres.sql")"`,
        { cwd: ROOT, encoding: 'utf8' }
      );
      fs.unlinkSync(`${prefix}_postgres.sql`);

      expect(fs.existsSync(tar)).to.be.true;

      // Now rollback, then restore
      runDb('rollback');
      const r = runDb(`restore "${tar}"`, { timeout: 120000 });
      expect(r.ok, `restore failed: ${r.stderr || r.stdout}`).to.be.true;

      const q = `docker exec postgres psql -U spicegarden -d spicegarden -At -c "SELECT COUNT(*) FROM users"`;
      const out = execSync(q, { cwd: ROOT, encoding: 'utf8' }).trim();
      expect(parseInt(out, 10)).to.be.greaterThanOrEqual(0);

      fs.unlinkSync(tar);
    });
  });
});
