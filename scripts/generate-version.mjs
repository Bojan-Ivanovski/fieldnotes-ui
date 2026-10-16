import { readFileSync, writeFileSync } from 'node:fs';
const { version } = JSON.parse(readFileSync('package.json'));
writeFileSync('src/version.ts', `export const version = '${version}';\n`);
