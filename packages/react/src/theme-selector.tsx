import React from 'react';
import {
  featuredPresets,
  presetInfo,
  paletteOptions,
  type Preset,
  type Palette,
  type Mode,
} from '@gregui/tokens';
import { Field, Grid, Select } from './index';

export interface ThemeSelection {
  preset: Preset;
  palette: Palette;
  mode: Mode;
}

/** Controlled appearance preferences. The consumer owns persistence and translated labels. */
export function ThemeSelector({
  value,
  onChange,
  labels,
  disabled = false,
}: {
  value: ThemeSelection;
  onChange: (value: ThemeSelection) => void;
  labels: { style: string; palette: string; mode: string; light: string; dark: string };
  disabled?: boolean;
}) {
  return (
    <Grid columns={3}>
      <Field label={labels.style}>
        {(props) => (
          <Select
            {...props}
            disabled={disabled}
            value={value.preset}
            onChange={(event) => onChange({ ...value, preset: event.target.value as Preset })}
          >
            {!featuredPresets.some((preset) => preset === value.preset) && (
              <option value={value.preset}>{presetInfo[value.preset].name} (saved)</option>
            )}
            {featuredPresets.map((preset) => (
              <option key={preset} value={preset}>
                {presetInfo[preset].name}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field label={labels.palette}>
        {(props) => (
          <Select
            {...props}
            disabled={disabled}
            value={value.palette}
            onChange={(event) => onChange({ ...value, palette: event.target.value as Palette })}
          >
            {paletteOptions.map((palette) => (
              <option key={palette.id} value={palette.id}>
                {palette.name}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field label={labels.mode}>
        {(props) => (
          <Select
            {...props}
            disabled={disabled}
            value={value.mode}
            onChange={(event) => onChange({ ...value, mode: event.target.value as Mode })}
          >
            <option value="light">{labels.light}</option>
            <option value="dark">{labels.dark}</option>
          </Select>
        )}
      </Field>
    </Grid>
  );
}
