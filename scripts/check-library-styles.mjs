// Counts hard-coded colour and font-size literals in the library stylesheet and fails when any
// category grows beyond scripts/style-literal-baseline.json. Existing literals are tolerated
// (the baseline records them); new rules must use theme variables.
// `node scripts/check-library-styles.mjs --update` rewrites the baseline after a justified change.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const stylesheet = 'packages/react/src/styles.css';
const baselinePath = join(root, 'scripts', 'style-literal-baseline.json');
const update = process.argv.includes('--update');

const categories = {
  hex: {
    label: 'hex colours',
    pattern: /#[\da-f]{3,8}(?![\w-])/gi,
    fix: 'use a theme colour role such as var(--g-text), var(--g-surface), var(--g-line) or var(--g-tint)',
  },
  colorFunction: {
    label: 'rgb()/hsl() colours with literal numbers',
    pattern: /\b(?:rgba?|hsla?)\(\s*[\d.]/gi,
    fix: 'use a colour role, or rgba(var(--g-shadow-color), <alpha>) for shadows',
  },
  fontSize: {
    label: 'literal font sizes',
    pattern: /\bfont-size\s*:[^;{}]*\d(?:\.\d+)?(?:px|rem|em|%|vw|vh|pt)\b/gi,
    fix: 'use a type token such as var(--g-type-small-size) or var(--g-type-caption-size)',
  },
};

// Blank out comments but keep line breaks so reported line numbers stay accurate.
const source = readFileSync(join(root, stylesheet), 'utf8').replace(/\/\*[\s\S]*?\*\//g, (c) =>
  c.replace(/[^\n]/g, ' '),
);
const lines = source.split('\n');
const found = Object.fromEntries(Object.keys(categories).map((key) => [key, []]));
lines.forEach((line, index) => {
  const text = line.trim();
  // Selector lines (`#id {`, `a,`) are not declarations; colour literals there are not colours.
  const selector = /[{,]$/.test(text) && !text.includes(':');
  for (const [key, { pattern }] of Object.entries(categories)) {
    if (selector && key !== 'fontSize') continue;
    for (const match of text.matchAll(pattern)) found[key].push({ line: index + 1, text, match });
  }
});

// Each occurrence is keyed by its trimmed declaration text so the report can name new lines
// without depending on line numbers, which shift whenever unrelated CSS is added.
const summarise = (items) => {
  const entries = {};
  for (const { text } of items) entries[text] = (entries[text] ?? 0) + 1;
  return Object.fromEntries(Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)));
};
const current = Object.fromEntries(
  Object.entries(found).map(([key, items]) => [
    key,
    { count: items.length, entries: summarise(items) },
  ]),
);

if (update) {
  writeFileSync(
    baselinePath,
    JSON.stringify({ file: stylesheet, categories: current }, null, 2) + '\n',
  );
  for (const [key, { count }] of Object.entries(current))
    console.log(`${categories[key].label}: ${count}`);
  console.log(`Wrote ${baselinePath}. Explain why literals were added in the commit message.`);
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(baselinePath, 'utf8')).categories;
let failed = false;
for (const [key, { label, fix }] of Object.entries(categories)) {
  const allowed = baseline[key] ?? { count: 0, entries: {} };
  const { count } = current[key];
  if (count <= allowed.count) {
    const note =
      count < allowed.count ? ' (lower than baseline; run with --update to lock it in)' : '';
    console.log(`${label}: ${count}/${allowed.count}${note}`);
    continue;
  }
  failed = true;
  console.error(`\n${label}: ${count}, baseline ${allowed.count}. New literals in ${stylesheet}:`);
  const seen = {};
  for (const { line, text } of found[key]) {
    seen[text] = (seen[text] ?? 0) + 1;
    if (seen[text] > (allowed.entries[text] ?? 0))
      console.error(`  ${stylesheet}:${line}  ${text}`);
  }
  console.error(`  Fix: ${fix}.`);
}
if (failed) {
  console.error(
    '\nNew library CSS must not hard-code colours or font sizes. Replace the literals listed above ' +
      'with var(--g-…) colour roles or var(--g-type-…) size tokens (add a token in ' +
      'packages/tokens/src/index.ts if no role fits). If a literal is genuinely required, run ' +
      '`node scripts/check-library-styles.mjs --update` and justify the new baseline in the commit.',
  );
  process.exit(1);
}
