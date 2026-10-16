import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import ts from 'typescript';
const source = resolve('src');
const files = readdirSync(source, { recursive: true })
  .filter(
    (file) =>
      /\.(?:ts|tsx)$/.test(file) && !/(?:test|stories|assets\.d)/.test(file),
  )
  .map((file) => resolve(source, file));
const ranks = { primitives: 1, core: 2, composites: 3, patterns: 4 };
const rank = (file) => {
  const match = relative(source, file).match(
    /^(?:components\/)?(primitives|core|composites|patterns)(?:\/|$)/,
  );
  return match
    ? ranks[match[1]]
    : relative(source, file).startsWith('foundations/')
      ? 0
      : undefined;
};
const graph = new Map();
for (const file of files) {
  const ast = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const edges = [];
  for (const node of ast.statements) {
    if (
      !(ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) ||
      !node.moduleSpecifier ||
      !ts.isStringLiteral(node.moduleSpecifier)
    )
      continue;
    const spec = node.moduleSpecifier.text;
    assert(
      !/(?:@fieldnotes\/|features\/|lib\/db|apiFor|\/home\/admin)/.test(spec),
      `Application dependency in ${relative(source, file)}`,
    );
    if (!spec.startsWith('.')) continue;
    const target = ts.resolveModuleName(
      spec,
      file,
      {
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        resolveJsonModule: true,
      },
      ts.sys,
    ).resolvedModule?.resolvedFileName;
    if (!target) continue;
    const from = rank(file),
      to = rank(target);
    assert(
      from === undefined || to === undefined || from >= to,
      `Reverse layer dependency: ${relative(source, file)} -> ${relative(source, target)}`,
    );
    if (
      files.includes(target) &&
      !(ts.isImportDeclaration(node) && node.importClause?.isTypeOnly)
    )
      edges.push(target);
  }
  graph.set(file, edges);
}
const visiting = new Set(),
  done = new Set();
function visit(file) {
  assert(!visiting.has(file), `Dependency cycle: ${relative(source, file)}`);
  if (done.has(file)) return;
  visiting.add(file);
  for (const target of graph.get(file) ?? []) visit(target);
  visiting.delete(file);
  done.add(file);
}
for (const file of files) visit(file);
console.log(
  `Verified dependency direction and absence of cycles across ${files.length} library source files.`,
);
