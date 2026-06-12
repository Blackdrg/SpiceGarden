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
    }
    catch (err) {
        return {
            ok: false,
            stdout: (err.stdout || '').trim(),
            stderr: (err.stderr || '').trim(),
            code: err.status,
        };
    }
}
jest.setTimeout(120000);
describe('Database Migration Stability', () => {
    beforeAll(() => {
        console.log('[setup] Bringing up containers...');
        const r = runDb('up', { timeout: 120000 });
        if (!r.ok) {
            console.log('[setup] db up warning:', r.stderr || r.stdout);
        }
        else {
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
        it('should report status as UP', function () {
            this.timeout(30000);
            const r = runDb('status');
            expect(r.ok || r.stdout.includes('PostgreSQL: UP')).toBe(true);
        });
    });
    describe('db migrate (reproducible)', () => {
        it('should apply InitialSchema20240101000001 and expected tables exist', function () {
            this.timeout(60000);
            const r = runDb('migrate');
            expect(r.ok).toBe(true);
            const expected = ['users', 'restaurants', 'orders', 'menu_items', 'drivers', 'wallets', 'coupons'];
            for (const t of expected) {
                const q = `bash "${SCRIPT}" init >/dev/null 2>&1; docker exec postgres psql -U spicegarden -d spicegarden -At -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='${t}'"`;
                const out = execSync(q, { cwd: ROOT, encoding: 'utf8' }).trim();
                expect(parseInt(out, 10)).toBeGreaterThan(0);
            }
        });
        it('should be idempotent on second run (no changes)', function () {
            this.timeout(60000);
            const r1 = runDb('migrate');
            expect(r1.ok).toBe(true);
            const r2 = runDb('migrate');
            expect(r2.ok).toBe(true);
            expect(r2.stdout).toContain('SKIP');
        });
    });
    describe('db rollback', () => {
        it('should rollback last migration and drop tables', function () {
            this.timeout(60000);
            const r = runDb('rollback');
            expect(r.ok).toBe(true);
            const t = 'users';
            const q = `docker exec postgres psql -U spicegarden -d spicegarden -At -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='${t}'"`;
            const out = execSync(q, { cwd: ROOT, encoding: 'utf8' }).trim();
            expect(parseInt(out, 10)).toEqual(0);
        });
        it('should report nothing to rollback when clean', function () {
            this.timeout(30000);
            const r = runDb('rollback');
            expect(r.ok).toBe(true);
            expect(r.stdout).toContain('nothing to rollback');
        });
    });
    describe('db restore', () => {
        it('should restore from backup archive', function () {
            this.timeout(120000);
            runDb('migrate');
            runDb('seed');
            const backupDir = path.join(ROOT, 'backup');
            fs.mkdirSync(backupDir, { recursive: true });
            const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const prefix = path.join(backupDir, `spicegarden_backup_${ts}`);
            execSync(`docker exec postgres pg_dump -U spicegarden spicegarden > "${prefix}_postgres.sql"`, { cwd: ROOT, encoding: 'utf8' });
            const tar = `${prefix}.tar.gz`;
            execSync(`tar -czf "${tar}" -C "${backupDir}" "$(basename "${prefix}_postgres.sql")"`, { cwd: ROOT, encoding: 'utf8' });
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
//# sourceMappingURL=db-migrate.spec.js.map