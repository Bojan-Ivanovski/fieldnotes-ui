import { execFileSync } from 'node:child_process';
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
mkdirSync('artifacts', { recursive: true });
const report = JSON.parse(
  execFileSync('npm', ['pack', '--json', '--pack-destination', 'artifacts'], {
    encoding: 'utf8',
  }),
);
const packed = Object.values(report)[0];
renameSync(`artifacts/${packed.filename}`, 'artifacts/fieldnotes-ui.tgz');
const root = mkdtempSync(`${tmpdir()}/fieldnotes-ui-consumers-`),
  paths = {};
for (const name of ['vite-react', 'nextjs']) {
  const cwd = `${root}/${name}`;
  paths[name] = cwd;
  cpSync(`examples/${name}`, cwd, {
    recursive: true,
    filter: (path) =>
      !/(?:^|\/)(?:node_modules|dist[^/]*|\.next|package-lock\.json|next-env\.d\.ts)(?:\/|$)/.test(
        path,
      ),
  });
  const manifest = JSON.parse(readFileSync(`${cwd}/package.json`));
  manifest.dependencies['fieldnotes-ui'] =
    `file:${resolve('artifacts/fieldnotes-ui.tgz')}`;
  writeFileSync(`${cwd}/package.json`, JSON.stringify(manifest, null, 2));
  execFileSync('npm', ['install'], { cwd, stdio: 'inherit' });
  execFileSync('npm', ['run', 'build'], {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
  });
  execFileSync('npm', ['ls', 'react', 'react-dom'], { cwd, stdio: 'inherit' });
}
execFileSync('npm', ['run', 'build'], {
  cwd: paths['vite-react'],
  stdio: 'inherit',
  env: { ...process.env, CONSUMER_TAILWIND: '1', VITE_CONSUMER_TAILWIND: '1' },
});
writeFileSync('artifacts/consumer-paths.json', JSON.stringify(paths, null, 2));
