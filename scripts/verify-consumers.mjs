import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const paths = JSON.parse(readFileSync('artifacts/consumer-paths.json'));
for (const [name, cwd] of Object.entries(paths)) {
  const deps = JSON.parse(
    execFileSync('npm', ['ls', 'react', 'react-dom', '--all', '--json'], {
      cwd,
      encoding: 'utf8',
    }),
  );
  function inspect(tree) {
    for (const [key, value] of Object.entries(tree.dependencies ?? {})) {
      if (key === 'react' || key === 'react-dom')
        assert.equal(value.version, '19.3.1');
      inspect(value);
    }
  }
  inspect(deps);
  execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      "import { createElement } from 'react'; import { renderToString } from 'react-dom/server'; import { Button, ThemeProvider, ResourceCard } from 'fieldnotes-ui'; const markup = renderToString(createElement(ThemeProvider,null,createElement(Button,null,'Packed SSR'),createElement(ResourceCard,{title:'Packed card'}))); if (!markup.includes('Packed SSR') || !markup.includes('<article') || !markup.includes('Packed card')) process.exit(1);",
    ],
    { cwd, stdio: 'inherit' },
  );
  const code =
    "import { Button, ThemeProvider, type ThemeTokens } from 'fieldnotes-ui';\nimport { Fieldset, Switch, ErrorSummary, Breadcrumb, Popover, Tooltip, Toast, DropdownMenuCheckboxItem, type CheckboxProps } from 'fieldnotes-ui/core';\nimport { SearchField, ResourceCard, SearchResults, LoadMoreButton, Navigation, NavigationGroup, NavigationLink, NavigationButton, type ResourceCardProps } from 'fieldnotes-ui/composites';\nimport { ResourceExplorer } from 'fieldnotes-ui/patterns';\nconst checkbox: CheckboxProps = { indeterminate: true };\nvoid checkbox;\nconst tokens: Partial<ThemeTokens> = { primary: '#123456' };\nconst card: ResourceCardProps = { title: 'A thought', headingLevel: 2 };\nvoid card;\nvoid [Button,ThemeProvider,SearchField,ResourceCard,SearchResults,LoadMoreButton,Navigation,NavigationGroup,NavigationLink,NavigationButton,ResourceExplorer,Fieldset,Switch,ErrorSummary,Breadcrumb,Popover,Tooltip,Toast,DropdownMenuCheckboxItem,tokens];\n";
  writeFileSync(`${cwd}/node-contract.mts`, code);
  execFileSync(
    process.execPath,
    [
      resolve(cwd, 'node_modules/typescript/bin/tsc'),
      '--ignoreConfig',
      '--noEmit',
      '--module',
      'NodeNext',
      '--moduleResolution',
      'NodeNext',
      '--target',
      'ES2022',
      '--jsx',
      'react-jsx',
      '--strict',
      '--types',
      'react,react-dom',
      'node-contract.mts',
    ],
    { cwd, stdio: 'inherit' },
  );
  console.log(
    `${name}: native Node ESM SSR, NodeNext declarations and React dependency versions verified.`,
  );
}
const chunks = JSON.parse(
  readFileSync(`${paths['vite-react']}/dist/bundle-report.json`),
);
const entry = Object.keys(chunks).find((key) =>
  chunks[key].entry?.endsWith('/minimal.html'),
);
assert(entry, 'Missing minimal consumer entry');
const seen = new Set();
function collect(file) {
  if (seen.has(file)) return;
  seen.add(file);
  for (const dependency of chunks[file]?.imports ?? []) collect(dependency);
}
collect(entry);
const modules = [...seen].flatMap((file) => chunks[file]?.modules ?? []);
assert(
  !modules.some((file) =>
    /@radix-ui|@headless-tree|codemirror|theme-provider/.test(file),
  ),
  'Minimal button pulls in unrelated runtime',
);
const bytes = [...seen].reduce(
  (sum, file) => sum + (chunks[file]?.bytes ?? 0),
  0,
);
assert(bytes < 300_000, 'Minimal consumer JS budget exceeded');
console.log(
  `Minimal Button consumer: ${bytes} JS bytes including React; no overlay, tree or theme runtime.`,
);
