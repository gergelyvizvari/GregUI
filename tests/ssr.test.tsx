import React, { act } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { it, expect, vi } from 'vitest';
import {
  ThemeProvider,
  LocaleProvider,
  TextField,
  LoginForm,
  Wizard,
  Accordion,
  Pagination,
  TreeView,
  Combobox,
  DataTable,
  FloatingPanel,
  Button,
} from '@gregui/react';
it('hydrates server-rendered themed fields without ID or markup mismatches', async () => {
  const tree = (
    <LocaleProvider locale="hu-HU">
      <ThemeProvider>
        <TextField label="Név" hint="Teljes név" />
        <LoginForm onSubmit={() => {}} />
        <Wizard
          steps={[{ value: 'details', label: 'Details', content: <TextField label="Project" /> }]}
          onComplete={() => {}}
        />
        <Accordion
          defaultOpen={['help']}
          items={[{ value: 'help', title: 'Help', content: 'Instructions' }]}
        />
        <Pagination page={1} pageCount={3} onPageChange={() => {}} />
        <TreeView
          label="Files"
          nodes={[{ id: 'root', label: 'Root', children: [{ id: 'child', label: 'Child' }] }]}
          defaultExpanded={['root']}
        />
        <Combobox
          label="Region"
          options={[{ value: 'uk', label: 'United Kingdom' }]}
          value="uk"
          onChange={() => {}}
        />
        <FloatingPanel
          trigger={<Button>Inspect theme</Button>}
          title="Inspector"
          description="Inspect this preview."
        >
          <TextField label="Inspector setting" />
        </FloatingPanel>
        <DataTable
          caption="Projects"
          rows={[{ id: 'one', name: 'One' }]}
          rowId={(row) => row.id}
          columns={[{ key: 'name', label: 'Name', value: (row) => row.name }]}
        />
      </ThemeProvider>
    </LocaleProvider>
  );
  const container = document.createElement('div');
  container.innerHTML = renderToString(tree);
  document.body.append(container);
  const originalId = container.querySelector('input')!.id;
  const recover = vi.fn();
  let root: ReturnType<typeof hydrateRoot>;
  await act(async () => {
    root = hydrateRoot(container, tree, { onRecoverableError: recover });
  });
  expect(recover).not.toHaveBeenCalled();
  expect(container.querySelector('input')!.id).toBe(originalId);
  expect(container.querySelector('label')!.htmlFor).toBe(originalId);
  await act(async () => root.unmount());
  container.remove();
});
