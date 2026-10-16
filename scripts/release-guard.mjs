import assert from 'node:assert/strict';
import { appendFileSync, readFileSync } from 'node:fs';
const pkg = JSON.parse(readFileSync('package.json'));
assert.equal(
  process.env.GITHUB_REF,
  'refs/heads/main',
  'Release must come from main',
);
assert.equal(
  pkg.version,
  process.env.EXPECTED_VERSION,
  'Dispatch must match the committed version',
);
assert.equal(
  pkg.name,
  'fieldnotes-ui',
  'Confirm the final npm package name before release',
);
if (process.env.PUBLISH_REQUESTED === 'true')
  assert.equal(
    pkg.private,
    false,
    'Publication remains locked until ownership/trust/license authorization is verified and private=false is reviewed',
  );
assert.equal(pkg.license, 'MIT', 'Review license changes before publication');
assert(
  readFileSync('CHANGELOG.md', 'utf8').includes(pkg.version),
  'Version missing from changelog',
);
appendFileSync(process.env.GITHUB_OUTPUT, `version=${pkg.version}\n`);
