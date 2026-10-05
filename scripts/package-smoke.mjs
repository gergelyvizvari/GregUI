import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
const root = process.cwd();
const dir = mkdtempSync(join(tmpdir(), 'gregui-package-'));
try {
  const tarballs = [];
  for (const name of ['tokens', 'localization', 'react']) {
    const result = JSON.parse(
      execFileSync('npm', ['pack', '--json', '--pack-destination', dir], {
        cwd: resolve(root, 'packages', name),
        encoding: 'utf8',
      }),
    );
    tarballs.push(join(dir, result[0].filename));
  }
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({
      name: 'gregui-package-smoke',
      version: '1.0.0',
      private: true,
      type: 'module',
    }),
  );
  execFileSync(
    'npm',
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      ...tarballs,
      'react@19.3.0',
      'react-dom@19.3.0',
    ],
    { cwd: dir, stdio: 'pipe' },
  );
  writeFileSync(
    join(dir, 'verify.mjs'),
    `import {createElement as h} from 'react';
import {renderToString} from 'react-dom/server';
import {ThemeProvider,Button,TextField,LocaleProvider,LoginForm,TreeView,Timeline,Combobox} from '@gregui/react';
import {createTheme,exportTheme} from '@gregui/tokens';
import {readFileSync} from 'node:fs';
const html=renderToString(h(LocaleProvider,null,h(ThemeProvider,{theme:createTheme('glass')},h(Button,null,'Save'),h(TextField,{label:'Name'}),h(LoginForm,{onSubmit:()=>{}}),h(TreeView,{label:'Files',nodes:[{id:'root',label:'Root'}]}),h(Timeline,{label:'History',items:[]}),h(Combobox,{label:'Region',value:'uk',options:[{value:'uk',label:'United Kingdom'}],onChange:()=>{}}))));
if(!html.includes('Save')||!html.includes('g-input'))throw Error('Public render failed');
const css=readFileSync(import.meta.resolve('@gregui/react/styles.css').replace('file://',''),'utf8');
if(!css.includes('.g-button'))throw Error('CSS export missing');
JSON.parse(exportTheme(createTheme()));
console.log('Isolated tarball install, public SSR render, theme export and stylesheet resolution passed.');
`,
  );
  execFileSync(process.execPath, ['verify.mjs'], { cwd: dir, stdio: 'inherit' });
} finally {
  rmSync(dir, { recursive: true, force: true });
}
