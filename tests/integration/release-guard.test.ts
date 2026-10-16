import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
function guard(overrides: Record<string, string> = {}) {
  const directory = mkdtempSync(resolve(tmpdir(), 'fieldnotes-release-guard-'));
  writeFileSync(
    resolve(directory, 'package.json'),
    JSON.stringify({
      name: 'fieldnotes-ui',
      version,
      private: true,
      license: 'MIT',
    }),
  );
  writeFileSync(resolve(directory, 'CHANGELOG.md'), `# ${version}`);
  return spawnSync(process.execPath, [resolve('scripts/release-guard.mjs')], {
    cwd: directory,
    encoding: 'utf8',
    env: {
      ...process.env,
      GITHUB_REF: 'refs/heads/main',
      EXPECTED_VERSION: version,
      PUBLISH_REQUESTED: 'false',
      GITHUB_OUTPUT: resolve(directory, 'output'),
      ...overrides,
    },
  });
}
it('allows verification-only runs without unlocking publication', () => {
  expect(guard().status).toBe(0);
});
it('rejects publication while ownership/trust authorization is locked', () => {
  const result = guard({ PUBLISH_REQUESTED: 'true' });
  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain('Publication remains locked');
});
it('rejects branch and version mismatches', () => {
  expect(guard({ GITHUB_REF: 'refs/heads/feature' }).status).not.toBe(0);
  expect(guard({ EXPECTED_VERSION: '999.0.0' }).status).not.toBe(0);
});
