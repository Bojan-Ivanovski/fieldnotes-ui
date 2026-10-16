import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
const manifest = JSON.parse(readFileSync('package.json'));
const pack = Object.values(
  JSON.parse(
    execFileSync('npm', ['pack', '--dry-run', '--json'], { encoding: 'utf8' }),
  ),
)[0];
assert(
  pack.files.every((file) =>
    /^(dist\/|package\.json$|README\.md$|LICENSE$|THIRD_PARTY_NOTICES\.md$)/.test(
      file.path,
    ),
  ),
  'Unexpected tarball file',
);
assert(
  !pack.files.some((file) =>
    /(?:test|stories|\.env|node_modules|\.next)/.test(file.path),
  ),
  'Development or private files in tarball',
);
assert(pack.unpackedSize < 300_000, 'Unpacked package budget exceeded');
assert(statSync('dist/styles.css').size < 25_000, 'CSS budget exceeded');
for (const [entry, value] of Object.entries(manifest.exports)) {
  const targets = typeof value === 'string' ? [value] : Object.values(value);
  for (const target of targets)
    assert(
      statSync(target).isFile(),
      `Missing export target ${entry}: ${target}`,
    );
}
const expected = {
  primitives: ['Heading', 'Spinner', 'Stack', 'Text', 'VisuallyHidden'],
  core: [
    'Label',
    'Fieldset',
    'ErrorSummary',
    'Switch',
    'Breadcrumb',
    'BreadcrumbList',
    'BreadcrumbItem',
    'BreadcrumbLink',
    'BreadcrumbPage',
    'BreadcrumbSeparator',
    'Separator',
    'TooltipProvider',
    'Tooltip',
    'TooltipTrigger',
    'TooltipContent',
    'Popover',
    'PopoverTrigger',
    'PopoverAnchor',
    'PopoverContent',
    'PopoverClose',
    'ToastProvider',
    'Toast',
    'ToastTitle',
    'ToastDescription',
    'ToastAction',
    'ToastClose',
    'ToastViewport',
    'DropdownMenuGroup',
    'DropdownMenuLabel',
    'DropdownMenuCheckboxItem',
    'DropdownMenuRadioGroup',
    'DropdownMenuRadioItem',
    'DropdownMenuSub',
    'DropdownMenuSubTrigger',
    'DropdownMenuSubContent',

    'Alert',
    'Badge',
    'Button',
    'Card',
    'Checkbox',
    'Dialog',
    'DialogClose',
    'DialogContent',
    'DialogDescription',
    'DialogTitle',
    'DialogTrigger',
    'DropdownMenu',
    'DropdownMenuContent',
    'DropdownMenuItem',
    'DropdownMenuSeparator',
    'DropdownMenuTrigger',
    'Field',
    'IconButton',
    'Input',
    'Radio',
    'Select',
    'Tabs',
    'TabsContent',
    'TabsList',
    'TabsTrigger',
    'Textarea',
  ],
  composites: ['ConfirmDialog', 'EmptyState', 'SearchField', 'ThemeSelector'],
  patterns: ['ApplicationShell', 'ResourceExplorer', 'Sidebar'],
  themes: ['ThemeProvider', 'builtInThemes', 'defineTheme', 'useTheme'],
  hooks: ['useTheme'],
};
for (const [entry, names] of Object.entries(expected))
  assert.deepEqual(
    Object.keys(await import(`../dist/${entry}.js`)).sort(),
    names.sort(),
    `Unexpected public exports: ${entry}`,
  );
assert.deepEqual(
  Object.keys(await import('../dist/index.js')).sort(),
  [...new Set([...Object.values(expected).flat(), 'version'])].sort(),
  'Root API mismatch',
);
assert(
  !('react' in manifest.dependencies) &&
    !('react-dom' in manifest.dependencies),
  'React must remain a peer',
);
console.log(
  `Verified ${pack.entryCount} tarball files, ${pack.size} packed bytes, export maps and exact ESM public surface.`,
);

assert.equal(
  (await import('../dist/version.js')).version,
  manifest.version,
  'Exported version must match package metadata',
);
