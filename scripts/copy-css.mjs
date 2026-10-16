import { copyFileSync, unlinkSync } from 'node:fs';
copyFileSync('src/styles/tailwind.css', 'dist/tailwind.css');
copyFileSync(
  'src/foundations/tokens/presets.json',
  'dist/foundations/tokens/presets.json',
);

for (const file of ['dist/styles-entry.js']) unlinkSync(file);
