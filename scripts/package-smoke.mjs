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
import {ThemeProvider,Button,TextField,LocaleProvider,LoginForm,TreeView,Timeline,Combobox,VisualChoiceGroup,DocumentPreview,DocumentSpread,MailFace,AddressFields} from '@gregui/react';
import {createTheme,exportTheme} from '@gregui/tokens';
import {readFileSync} from 'node:fs';
const html=renderToString(h(LocaleProvider,null,h(ThemeProvider,{theme:createTheme('glass')},h(Button,null,'Save'),h(TextField,{label:'Name'}),h(LoginForm,{onSubmit:()=>{}}),h(TreeView,{label:'Files',nodes:[{id:'root',label:'Root'}]}),h(Timeline,{label:'History',items:[]}),h(Combobox,{label:'Region',value:'uk',options:[{value:'uk',label:'United Kingdom'}],onChange:()=>{}}))));
if(!html.includes('Save')||!html.includes('g-input'))throw Error('Public render failed');
const proof=renderToString(h(ThemeProvider,null,
  h(MailFace,{label:'Envelope',variant:'envelope',postageLabel:'Postage',recipient:{label:'Recipient',content:'Postal recipient'}}),
  h(DocumentSpread,{label:'Open document',panels:[{label:'First panel',content:'Left panel'},{label:'Second panel',content:'Right panel'}]}),
  h(AddressFields,{label:'Postal address',value:{recipient:'Sam',addressLine1:'12 Example Lane',addressLine2:'',locality:'London',region:'',postalCode:'SW1A 1AA',countryCode:'GB'},onChange:()=>{},fields:[{key:'addressLine1',label:'Street'}],countries:[{value:'GB',label:'United Kingdom'}]}),
  h(VisualChoiceGroup,{label:'Design',value:'lake',onChange:()=>{},options:[{value:'lake',label:'Lake',preview:'Lake artwork'}]}),
  h(DocumentPreview,{label:'Proof',widthMm:148,heightMm:105,pageId:'front',onPageChange:()=>{},pages:[{id:'front',label:'Front',content:'Postcard'}],labels:{page:'Side',zoom:'Zoom',fit:'Fit',guides:'Guides'}})));
if(!proof.includes('Postal recipient')||!proof.includes('Left panel')||!proof.includes('12 Example Lane')||!proof.includes('g-visual-choice-group')||!proof.includes('g-document-sheet'))throw Error('Visual document exports failed');
const css=readFileSync(import.meta.resolve('@gregui/react/styles.css').replace('file://',''),'utf8');
if(!css.includes('.g-button')||!css.includes('.g-document-sheet')||!css.includes('.g-visual-choice-group'))throw Error('CSS export missing');
JSON.parse(exportTheme(createTheme()));
console.log('Isolated tarball install, public SSR render, theme export and stylesheet resolution passed.');
`,
  );
  execFileSync(process.execPath, ['verify.mjs'], { cwd: dir, stdio: 'inherit' });
} finally {
  rmSync(dir, { recursive: true, force: true });
}
