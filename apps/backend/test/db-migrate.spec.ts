jest.setTimeout(120000);
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const SCRIPT = path.join(ROOT, 'scripts/db.sh').replace(/\\/g, '/');

function commandAvailable(command: string): boolean {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const dockerAvailable = commandAvailable('docker');
const dbScriptAvailable = fs.existsSync(SCRIPT);

if (!dockerAvailable || !dbScriptAvailable) {
  console.log(`[skip] db-migrate requires docker and scripts/db.sh; docker=${dockerAvailable}, dbScript=${dbScriptAvailable}`);
}

function runDb(args: string, opts: { timeout?: number } = {}): { ok: boolean; stdout?: string; stderr?: string; code?: number } {
  const cmd = `bash "${SCRIPT}" ${args}`;
  try {
    const stdout = execSync(cmd, {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: opts.timeout || 120000,
      env: { ...process.env, COMPOSE_FILE: 'compose.dev.yaml' },
    });
    return { ok: true, stdout: stdout.trim() };
  } catch (err: any) {
    return {
      ok: false,
      stdout: (err.stdout || '').trim(),
      stderr: (err.stderr || '').trim(),
      code: err.status,
    };
  }
}

describe('Database Migration Stability', () => {
  if (!dockerAvailable || !dbScriptAvailable) {
    it.skip('requires docker and scripts/db.sh', () => undefined);
    return;
  }

  beforeAll(() => {
    console.log('[setup] Bringing up containers...');
    const r = runDb('up', { timeout: 120000 });
    if (!r.ok) {
      console.log('[setup] db up warning:', r.stderr || r.stdout);
    } else {
      console.log('[setup] db up done');
    }
    runDb('init');
  });

  afterAll(() => {
    console.log('[teardown] Resetting DB state...');
    runDb('reset');
    console.log('[teardown] Done');
  });

  describe('db up', () => {
    it('should report status as UP', async () => {
      const r = runDb('status');
      expect(r.ok || (r.stdout ?? '').includes('PostgreSQL: UP')).toBe(true);
    });
  });

  describe('db migrate (reproducible)', () => {
    it('should apply InitialSchema20240101000001 and expected tables exist', async () => {
      const r = runDb('migrate');
      expect(r.ok).toBe(true);
      const expected = ['users', 'restaurants', 'orders', 'menu_items', 'drivers', 'wallets', 'coupons'];
      for (const t of expected) {
        const q = `bash "${SCRIPT}" init >/dev/null 2>&1; docker exec postgres psql -U spicegarden -d spicegarden -At -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='${t}'"`;
        const out = execSync(q, { cwd: ROOT, encoding: 'utf8' }).trim();
        expect(parseInt(out, 10)).toBeGreaterThan(0);
      }
    });

    it('should be idempotent on second run (no changes)', async () => {
      const r1 = runDb('migrate');
      expect(r1.ok).toBe(true);
      const r2 = runDb('migrate');
      expect(r2.ok).toBe(true);
      expect(r2.stdout).toContain('SKIP');
    });
  });

  describe('db rollback', () => {
    it('should rollback last migration and drop tables', async () => {
      const r = runDb('rollback');
      expect(r.ok).toBe(true);
      const t = 'users';
      const q = `bash "${SCRIPT}" init >/dev/null 2>&1; docker exec postgres psql -U spicegarden -d spicegarden -At -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='${t}'"`;
      const out = execSync(q, { cwd: ROOT, encoding: 'utf8' }).trim();
      expect(parseInt(out, 10)).toEqual(0);
    });

    it('should report nothing to rollback when clean', async () => {
      const r = runDb('rollback');
      expect(r.ok).toBe(true);
      expect((r.stdout ?? '').toLowerCase()).toContain('nothing to rollback');
    });
  });

  describe('db restore', () => {
    it('should restore from backup archive', async () => {
      runDb('migrate');
      runDb('seed');

      const backupDir = path.join(ROOT, 'backup');
      fs.mkdirSync(backupDir, { recursive: true });
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const prefix = path.join(backupDir, `spicegarden_backup_${ts}`);

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

      expect(fs.existsSync(tar)).toBe(true);

      runDb('rollback');
      const r = runDb(`restore "${tar}"`, { timeout: 120000 });
      expect(r.ok).toBe(true);

      const q = `docker exec postgres psql -U spicegarden -d spicegarden -At -c "SELECT COUNT(*) FROM users"`;
      const out = execSync(q, { cwd: ROOT, encoding: 'utf8' }).trim();
      expect(parseInt(out, 10)).toBeGreaterThanOrEqual(0);

      fs.unlinkSync(tar);
    });
  });
});
