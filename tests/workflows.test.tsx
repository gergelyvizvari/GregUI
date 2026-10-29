import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { Accordion, LocaleProvider, Pagination, Stepper, TextField, Wizard } from '@gregui/react';

it('opens independent native disclosures', async () => {
  const user = userEvent.setup();
  render(
    <Accordion
      items={[
        { value: 'one', title: 'One', content: 'First answer' },
        { value: 'two', title: 'Two', content: 'Second answer' },
      ]}
    />,
  );
  await user.click(screen.getByText('One'));
  await user.click(screen.getByText('Two'));
  expect(screen.getByText('First answer').closest('details')).toHaveAttribute('open');
  expect(screen.getByText('Second answer').closest('details')).toHaveAttribute('open');
});

it('bounds pagination and exposes the current page with translated navigation', async () => {
  const change = vi.fn();
  const user = userEvent.setup();
  const { rerender } = render(<Pagination page={1} pageCount={100} onPageChange={change} />);
  expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getAllByRole('button').length).toBeLessThanOrEqual(7);
  await user.click(screen.getByRole('button', { name: 'Next' }));
  expect(change).toHaveBeenCalledWith(2);
  rerender(
    <LocaleProvider messages={{ next: 'Következő' }}>
      <Pagination page={100} pageCount={100} onPageChange={change} />
    </LocaleProvider>,
  );
  expect(screen.getByRole('button', { name: 'Következő' })).toBeDisabled();
});

it('announces current and completed steps without creating navigation controls', () => {
  render(
    <Stepper
      currentStep={1}
      steps={[
        { value: 'a', label: 'Details' },
        { value: 'b', label: 'Review' },
      ]}
    />,
  );
  expect(screen.getByText('Review').closest('li')).toHaveAttribute('aria-current', 'step');
  expect(screen.getByText(/Completed/)).toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('validates before advancing and moves focus to the new step', async () => {
  const validate = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
  const user = userEvent.setup();
  render(
    <Wizard
      onComplete={vi.fn()}
      steps={[
        { value: 'a', label: 'Details', content: <TextField label="Name" />, validate },
        { value: 'b', label: 'Review', content: 'Check details' },
      ]}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  expect(screen.getByLabelText('Name')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Review' })).toHaveFocus());
  await user.click(screen.getByRole('button', { name: 'Back' }));
  expect(screen.getByRole('heading', { name: 'Details' })).toHaveFocus();
});

it('locks pending completion and offers retry after failure', async () => {
  let reject!: (reason: Error) => void;
  const complete = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((_, fail) => {
          reject = fail;
        }),
    )
    .mockResolvedValueOnce(undefined);
  const user = userEvent.setup();
  render(
    <Wizard
      onComplete={complete}
      steps={[{ value: 'a', label: 'Review', content: <TextField label="Name" /> }]}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Finish' }));
  expect(screen.getByLabelText('Name')).toBeDisabled();
  expect(screen.getByRole('button', { name: /Finish/ })).toBeDisabled();
  reject(new Error('Failed'));
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not continue');
  await user.click(screen.getByRole('button', { name: 'Finish' }));
  expect(complete).toHaveBeenCalledTimes(2);
  await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
});

it('renders step titles at the requested heading level', () => {
  render(
    <Wizard
      headingLevel={2}
      onComplete={vi.fn()}
      steps={[{ value: 'a', label: 'Details', content: 'Fill in' }]}
    />,
  );
  expect(screen.getByRole('heading', { name: 'Details', level: 2 })).toBeInTheDocument();
});
