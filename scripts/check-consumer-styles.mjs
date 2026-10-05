import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const failures = [];
function visit(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', 'dist'].includes(entry.name)) visit(file);
      continue;
    }
    if (/\.(css|scss|sass|less)$/.test(file)) {
      failures.push(`${file}: consumer styles belong in @gregui/react`);
      continue;
    }
    if (!/\.[jt]sx?$/.test(file)) continue;
    const source = ts.createSourceFile(
      file,
      fs.readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    function walk(node) {
      if (ts.isJsxAttribute(node) && ['style', 'className'].includes(node.name.getText(source)))
        failures.push(`${file}: use gregUI props instead of ${node.name.getText(source)}`);
      if (ts.isImportDeclaration(node)) {
        const name = node.moduleSpecifier.text;
        if (/\.(css|scss|sass|less)(\?|$)/.test(name) && name !== '@gregui/react/styles.css')
          failures.push(`${file}: unsupported stylesheet ${name}`);
        if (/(styled-components|@emotion|tailwind)/.test(name))
          failures.push(`${file}: styling dependencies belong in the shared package`);
      }
      ts.forEachChild(node, walk);
    }
    walk(source);
  }
}
for (const dir of ['apps/playground/src', 'examples/consumer/src']) visit(dir);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(
  'Consumer style boundary passed: no local CSS, style/className props or styling-library imports.',
);
