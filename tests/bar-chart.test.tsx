import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { BarChart } from '@gregui/react';

it('draws stacked bars and gives the same numbers as a table', () => {
  render(
    <BarChart
      label="Cards per day"
      series={[{ label: 'E-card' }, { label: 'Printed' }]}
      bars={[
        { label: '3 Nov', values: [2, 1] },
        { label: '4 Nov', values: [0, 0] },
      ]}
    />,
  );
  const figure = screen.getByRole('figure', { name: 'Cards per day' });
  const table = within(figure).getByRole('table');
  expect(within(table).getByRole('row', { name: '3 Nov 2 1' })).toBeInTheDocument();
  expect(figure.querySelectorAll('.g-bar-chart-part')).toHaveLength(2);
});

it('says so when every value is zero', () => {
  render(
    <BarChart
      label="Cards per day"
      series={[{ label: 'E-card' }, { label: 'Printed' }]}
      bars={[{ label: '4 Nov', values: [0, 0] }]}
      emptyMessage="No cards yet."
    />,
  );
  expect(screen.getByText('No cards yet.')).toBeInTheDocument();
  // No legend for bars that are not there.
  expect(screen.queryByText('Printed', { selector: 'li' })).not.toBeInTheDocument();
});
