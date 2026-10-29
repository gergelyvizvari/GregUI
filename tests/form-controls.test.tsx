import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { LocaleProvider, NumberField, SegmentedControl, Slider } from '@gregui/react';

const views = [
  { value: 'list', label: 'List', icon: 'menu' as const },
  { value: 'grid', label: 'Grid', icon: 'grid' as const },
  { value: 'board', label: 'Board', disabled: true },
  { value: 'map', label: 'Map' },
];

describe('SegmentedControl', () => {
  it('is a named radio group with hint and error descriptions', () => {
    render(
      <SegmentedControl label="View" options={views} hint="Pick a layout" error="Choose one" />,
    );
    const group = screen.getByRole('group', { name: 'View' });
    expect(group).toHaveAccessibleDescription('Pick a layout Choose one');
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    expect(screen.getByRole('radio', { name: 'List' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('aria-invalid', 'true');
    expect(group.querySelector('[data-icon="grid"]')).toHaveAttribute('aria-hidden', 'true');
  });
  it('can hide its label visually while keeping the name', () => {
    render(<SegmentedControl label="Period" hideLabel options={views} />);
    expect(screen.getByText('Period')).toHaveClass('g-sr-only');
    expect(screen.getByRole('group', { name: 'Period' })).toBeInTheDocument();
  });
  it('moves and selects with arrow keys, Home and End, skipping disabled options', async () => {
    const onValueChange = vi.fn();
    render(<SegmentedControl label="View" options={views} onValueChange={onValueChange} />);
    const list = screen.getByRole('radio', { name: 'List' });
    list.focus();
    fireEvent.keyDown(list, { key: 'ArrowRight' });
    expect(screen.getByRole('radio', { name: 'Grid' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'Grid' })).toBeChecked();
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
    expect(screen.getByRole('radio', { name: 'Map' })).toBeChecked();
    fireEvent.keyDown(document.activeElement!, { key: 'Home' });
    expect(list).toBeChecked();
    fireEvent.keyDown(document.activeElement!, { key: 'End' });
    expect(screen.getByRole('radio', { name: 'Map' })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' });
    expect(screen.getByRole('radio', { name: 'Grid' })).toBeChecked();
    expect(onValueChange.mock.calls.map(([value]) => value)).toEqual([
      'grid',
      'map',
      'list',
      'map',
      'grid',
    ]);
    expect(screen.getByRole('radio', { name: 'Board' })).toBeDisabled();
  });
  it('reverses horizontal arrows in right-to-left layouts', () => {
    render(
      <LocaleProvider direction="rtl">
        <div dir="rtl">
          <SegmentedControl label="View" options={views} defaultValue="grid" />
        </div>
      </LocaleProvider>,
    );
    const grid = screen.getByRole('radio', { name: 'Grid' });
    grid.focus();
    fireEvent.keyDown(grid, { key: 'ArrowLeft' });
    expect(screen.getByRole('radio', { name: 'Map' })).toBeChecked();
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
    expect(grid).toBeChecked();
  });
  it('stays controlled and reports clicks', async () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <SegmentedControl label="View" options={views} value="grid" onValueChange={onValueChange} />,
    );
    await userEvent.click(screen.getByText('Map'));
    expect(onValueChange).toHaveBeenCalledWith('map');
    expect(screen.getByRole('radio', { name: 'Grid' })).toBeChecked();
    rerender(
      <SegmentedControl label="View" options={views} value="map" onValueChange={onValueChange} />,
    );
    expect(screen.getByRole('radio', { name: 'Map' })).toBeChecked();
  });
  it('disables every option when the group is disabled', () => {
    render(<SegmentedControl label="View" options={views} disabled />);
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled();
  });
});

describe('Slider', () => {
  it('labels a native range with formatted value text and descriptions', () => {
    render(
      <Slider
        label="Opacity"
        hint="Applies to the overlay"
        error="Too low"
        defaultValue={0.4}
        min={0}
        max={1}
        step={0.1}
        formatOptions={{ style: 'percent' }}
      />,
    );
    const slider = screen.getByRole('slider', { name: 'Opacity' });
    expect(slider).toHaveAttribute('type', 'range');
    expect(slider).toHaveAttribute('aria-valuetext', '40%');
    expect(slider).toHaveAccessibleDescription('Applies to the overlay Too low');
    expect(slider).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('40%').tagName).toBe('OUTPUT');
  });
  it('is uncontrolled by default and reports changes', () => {
    const onValueChange = vi.fn();
    render(<Slider label="Volume" defaultValue={20} onValueChange={onValueChange} />);
    const slider = screen.getByRole('slider', { name: 'Volume' });
    fireEvent.change(slider, { target: { value: '35' } });
    expect(onValueChange).toHaveBeenCalledWith(35);
    expect(slider).toHaveValue('35');
    expect(slider).toHaveAttribute('aria-valuetext', '35');
  });
  it('follows a controlled value and names the mark it rests on', () => {
    function Controlled() {
      const [value, setValue] = useState(50);
      return (
        <Slider
          label="Quality"
          value={value}
          onValueChange={(next) => setValue(Math.min(next, 75))}
          marks={[{ value: 0, label: 'Low' }, { value: 50, label: 'Medium' }, { value: 100 }]}
        />
      );
    }
    const { container } = render(<Controlled />);
    const slider = screen.getByRole('slider', { name: 'Quality' });
    expect(slider).toHaveAttribute('aria-valuetext', '50, Medium');
    fireEvent.change(slider, { target: { value: '90' } });
    expect(slider).toHaveValue('75');
    expect(container.querySelector('.g-slider-marks')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('.g-slider-mark')).toHaveLength(3);
    expect(screen.getByText('100')).toBeInTheDocument();
  });
  it('formats with the locale and supports disabled', () => {
    render(
      <LocaleProvider locale="hu-HU">
        <Slider label="Ár" defaultValue={15000.5} min={0} max={50000} step={0.5} disabled />
      </LocaleProvider>,
    );
    const slider = screen.getByRole('slider', { name: 'Ár' });
    expect(slider).toBeDisabled();
    expect(slider.getAttribute('aria-valuetext')).toMatch(/^15\s000,5$/);
  });
});

describe('NumberField', () => {
  it('labels a decimal text input and its stepper buttons', () => {
    render(<NumberField label="Quantity" hint="Whole boxes" defaultValue={2} />);
    const input = screen.getByRole('textbox', { name: 'Quantity' });
    expect(input).toHaveAttribute('inputmode', 'decimal');
    expect(input).toHaveAccessibleDescription('Whole boxes');
    expect(input).toHaveValue('2');
    expect(screen.getByRole('button', { name: 'Increase' })).toHaveAttribute(
      'aria-controls',
      input.id,
    );
    expect(screen.getByRole('button', { name: 'Decrease' })).toBeInTheDocument();
  });
  it('steps with buttons, arrows and page keys within min and max', async () => {
    const onValueChange = vi.fn();
    render(
      <NumberField
        label="Guests"
        defaultValue={1}
        min={0}
        max={30}
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Guests' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveValue('2');
    fireEvent.keyDown(input, { key: 'PageUp' });
    expect(input).toHaveValue('12');
    fireEvent.keyDown(input, { key: 'PageUp' });
    fireEvent.keyDown(input, { key: 'PageUp' });
    expect(input).toHaveValue('30');
    expect(screen.getByRole('button', { name: 'Increase' })).toBeDisabled();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveValue('29');
    await userEvent.click(screen.getByRole('button', { name: 'Decrease' }));
    expect(input).toHaveValue('28');
    fireEvent.keyDown(input, { key: 'PageDown' });
    fireEvent.keyDown(input, { key: 'PageDown' });
    fireEvent.keyDown(input, { key: 'PageDown' });
    expect(input).toHaveValue('0');
    expect(screen.getByRole('button', { name: 'Decrease' })).toBeDisabled();
    expect(onValueChange.mock.calls.map(([value]) => value)).toEqual([
      2, 12, 22, 30, 29, 28, 18, 8, 0,
    ]);
  });
  it('parses Hungarian decimal commas and space grouping, then normalises on blur', async () => {
    const onValueChange = vi.fn();
    render(
      <LocaleProvider locale="hu-HU">
        <NumberField label="Összeg" onValueChange={onValueChange} />
      </LocaleProvider>,
    );
    const input = screen.getByRole('textbox', { name: 'Összeg' });
    await userEvent.type(input, '12 345,5');
    // The typed text is kept while typing.
    expect(input).toHaveValue('12 345,5');
    expect(onValueChange).toHaveBeenLastCalledWith(12345.5);
    await userEvent.tab();
    expect((input as HTMLInputElement).value).toMatch(/^12\s345,5$/);
    expect(screen.getByRole('button', { name: 'Növelés' })).toBeInTheDocument();
    await userEvent.clear(input);
    await userEvent.type(input, '3.25');
    expect(onValueChange).toHaveBeenLastCalledWith(3.25);
  });
  it('parses en-GB grouping and currency text', async () => {
    const onValueChange = vi.fn();
    render(
      <NumberField
        label="Budget"
        formatOptions={{ style: 'currency', currency: 'GBP' }}
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Budget' });
    await userEvent.type(input, '£1,234.5');
    expect(onValueChange).toHaveBeenLastCalledWith(1234.5);
    await userEvent.tab();
    expect(input).toHaveValue('£1,234.50');
  });
  it('treats percent text as a fraction', async () => {
    const onValueChange = vi.fn();
    render(
      <NumberField
        label="Discount"
        formatOptions={{ style: 'percent' }}
        defaultValue={0.1}
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Discount' });
    expect(input).toHaveValue('10%');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveValue('11%');
    await userEvent.clear(input);
    await userEvent.type(input, '25');
    expect(onValueChange).toHaveBeenLastCalledWith(0.25);
  });
  it('flags invalid and out-of-range text after blur without changing it', async () => {
    const onValueChange = vi.fn();
    render(<NumberField label="Age" min={18} max={120} onValueChange={onValueChange} />);
    const input = screen.getByRole('textbox', { name: 'Age' });
    await userEvent.type(input, '12');
    expect(input).not.toHaveAttribute('aria-invalid');
    await userEvent.tab();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Enter 18 or more.');
    expect(input).toHaveValue('12');
    expect(onValueChange).toHaveBeenLastCalledWith(12);
    await userEvent.clear(input);
    await userEvent.type(input, '12a');
    expect(input).toHaveValue('12a');
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(input).toHaveAccessibleDescription('Enter a number.');
    await userEvent.clear(input);
    await userEvent.type(input, '200');
    expect(input).toHaveAccessibleDescription('Enter 120 or less.');
  });
  it('lets the application error replace built-in feedback', () => {
    render(<NumberField label="Seats" error="No seats left" defaultValue={500} max={10} />);
    expect(screen.getByRole('textbox', { name: 'Seats' })).toHaveAccessibleDescription(
      'No seats left',
    );
  });
  it('follows a controlled value without rewriting text while typing', async () => {
    function Controlled() {
      const [value, setValue] = useState<number | null>(5);
      return (
        <>
          <NumberField label="Count" value={value} onValueChange={setValue} name="count" />
          <button onClick={() => setValue(null)}>Reset</button>
          <output data-testid="value">{String(value)}</output>
        </>
      );
    }
    const { container } = render(<Controlled />);
    const input = screen.getByRole('textbox', { name: 'Count' });
    await userEvent.clear(input);
    await userEvent.type(input, '1.50');
    expect(input).toHaveValue('1.50');
    expect(screen.getByTestId('value')).toHaveTextContent('1.5');
    expect(container.querySelector('input[type="hidden"]')).toHaveValue('1.5');
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(input).toHaveValue('');
  });
  it('disables the input and buttons', () => {
    render(<NumberField label="Locked" defaultValue={1} disabled />);
    expect(screen.getByRole('textbox', { name: 'Locked' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Increase' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Decrease' })).toBeDisabled();
  });
});
