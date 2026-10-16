import { format } from 'prettier';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
const manifest = JSON.parse(readFileSync('package.json'));
const visited = new Map();
function inspect(name, from) {
  const req = createRequire(resolve(from, 'package.json'));
  let entry;
  try {
    entry = req.resolve(`${name}/package.json`);
  } catch {
    let folder = dirname(req.resolve(name));
    while (folder !== '/') {
      try {
        const pkg = JSON.parse(readFileSync(resolve(folder, 'package.json')));
        if (pkg.name === name) {
          entry = resolve(folder, 'package.json');
          break;
        }
      } catch {
        /* ascend to owning manifest */
      }
      folder = dirname(folder);
    }
  }
  assert(entry, `Missing manifest for ${name}`);
  const pkg = JSON.parse(readFileSync(entry));
  const key = `${pkg.name}@${pkg.version}`;
  if (visited.has(key)) return;
  assert(
    /^(MIT|ISC|Apache-2\.0|BSD-2-Clause|BSD-3-Clause|0BSD|\(MIT OR Apache-2\.0\))$/.test(
      pkg.license ?? '',
    ),
    `Review required for ${key}: ${pkg.license}`,
  );
  visited.set(key, pkg.license);
  for (const dependency of Object.keys(pkg.dependencies ?? {}))
    inspect(dependency, dirname(entry));
}
for (const name of [
  ...Object.keys(manifest.dependencies),
  ...Object.keys(manifest.peerDependencies),
])
  inspect(name, process.cwd());
const body =
  '# Third-party notices\n\nFieldnotes UI source is MIT licensed, derived from the MIT-licensed Fieldnotes application (copyright 2026 Bojan-Ivanovski and Fieldnotes contributors). No logo, font binaries, backend data or editor implementation is distributed in the package. Manrope is named as an optional font-family; consumers supply their own licensed font assets.\n\nRuntime and peer dependencies retain their own licenses and copyright notices in their npm distributions. They are externalized, not vendored. This inventory records the actual locked dependency closure. Development dependencies are not shipped.\n\n| Dependency | License |\n| --- | --- |\n' +
  [...visited]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, license]) => `| ${name} | ${license} |`)
    .join('\n') +
  '\n';
const formatted = await format(body, { parser: 'markdown' });
if (process.argv.includes('--write'))
  writeFileSync('THIRD_PARTY_NOTICES.md', formatted);
else
  assert.equal(
    readFileSync('THIRD_PARTY_NOTICES.md', 'utf8'),
    formatted,
    'Dependency notices are stale; run node scripts/check-licenses.mjs --write',
  );
console.log(
  `Verified redistribution licenses for ${visited.size} runtime/peer packages.`,
);
