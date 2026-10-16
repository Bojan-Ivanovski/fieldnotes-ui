import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const paths = JSON.parse(readFileSync('artifacts/consumer-paths.json'));
const name = process.argv[2],
  port = process.argv[3],
  mode = process.argv[4] ?? 'dist';
const args =
  name === 'nextjs'
    ? [
        resolve(paths[name], 'node_modules/next/dist/bin/next'),
        'start',
        '--hostname',
        '0.0.0.0',
        '--port',
        port,
      ]
    : ['scripts/serve-static.mjs', resolve(paths[name], mode), port];
const child = spawn(process.execPath, args, {
  cwd: name === 'nextjs' ? paths[name] : process.cwd(),
  stdio: 'inherit',
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
});
for (const signal of ['SIGTERM', 'SIGINT'])
  process.on(signal, () => child.kill(signal));
child.on('exit', (code) => process.exit(code ?? 1));
