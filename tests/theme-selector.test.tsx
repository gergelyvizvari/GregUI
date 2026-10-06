import { featuredPresets, paletteOptions } from '@gregui/tokens';
import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { ThemeSelector, type ThemeSelection } from '@gregui/react';
const labels = {
  style: 'Visual style',
  palette: 'Colour palette',
  mode: 'Colour mode',
  light: 'Light',
  dark: 'Dark',
};
it('changes each preference independently and keeps keyboard focus', async () => {
  function Fixture() {
    const [value, onChange] = useState<ThemeSelection>({
      preset: 'flat',
      palette: 'cobalt',
      mode: 'light',
    });
    return <ThemeSelector value={value} onChange={onChange} labels={labels} />;
  }
  const user = userEvent.setup();
  render(<Fixture />);
  const style = screen.getByLabelText('Visual style');
  await user.selectOptions(style, 'glass');
  expect(style).toHaveFocus();
  await user.selectOptions(screen.getByLabelText('Colour palette'), 'plum');
  await user.selectOptions(screen.getByLabelText('Colour mode'), 'dark');
  expect(style).toHaveValue('glass');
  expect(screen.getByLabelText('Colour palette')).toHaveValue('plum');
  expect(screen.getByLabelText('Colour mode')).toHaveValue('dark');
  expect(style.querySelectorAll('option')).toHaveLength(featuredPresets.length);
  expect(screen.getByLabelText('Colour palette').querySelectorAll('option')).toHaveLength(
    paletteOptions.length,
  );
});
it('supports translated labels and locks all controls when disabled', () => {
  render(
    <ThemeSelector
      value={{ preset: 'clay', palette: 'ink', mode: 'dark' }}
      onChange={() => {}}
      labels={{
        style: 'Stílus',
        palette: 'Paletta',
        mode: 'Megjelenés',
        light: 'Világos',
        dark: 'Sötét',
      }}
      disabled
    />,
  );
  expect(screen.getByLabelText('Stílus')).toBeDisabled();
  expect(screen.getByLabelText('Paletta')).toBeDisabled();
  expect(screen.getByLabelText('Megjelenés')).toBeDisabled();
  expect(screen.getByRole('option', { name: 'Sötét' })).toBeInTheDocument();
});
