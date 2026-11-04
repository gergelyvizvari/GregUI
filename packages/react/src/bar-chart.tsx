'use client';
import { useId } from 'react';

export interface BarChartSeries {
  /** Translated name, shown in the legend and the table header. */
  label: string;
}
export interface BarChartBar {
  /** Short label under the bar, for example "4 Nov". */
  label: string;
  /** One value per series, stacked from the bottom in series order. */
  values: readonly number[];
}
export interface BarChartProps {
  /** Visible title, also the accessible name of the chart. */
  label: string;
  series: readonly BarChartSeries[];
  bars: readonly BarChartBar[];
  /** Formats values for the totals and the table. Defaults to the plain number. */
  format?: (value: number) => string;
  /** Shown instead of the bars when every value is zero. */
  emptyMessage?: string;
}

/**
 * A small stacked bar chart for counts over a few periods, such as cards per day. The bars are
 * decorative; the same numbers are in a visually hidden table for assistive technology.
 */
export function BarChart({ label, series, bars, format = String, emptyMessage }: BarChartProps) {
  const id = useId();
  const totals = bars.map((bar) => bar.values.reduce((sum, value) => sum + value, 0));
  const max = Math.max(0, ...totals);
  return (
    <figure className="g-bar-chart" aria-labelledby={`${id}-title`}>
      <figcaption className="g-bar-chart-title" id={`${id}-title`}>
        {label}
      </figcaption>
      {max === 0 && emptyMessage ? (
        <p className="g-bar-chart-empty">{emptyMessage}</p>
      ) : (
        <div className="g-bar-chart-bars" aria-hidden="true">
          {bars.map((bar, index) => (
            <div key={`${bar.label}-${index}`} className="g-bar-chart-column">
              <span className="g-bar-chart-total">
                {totals[index] ? format(totals[index]) : ''}
              </span>
              <div className="g-bar-chart-track">
                {bar.values.map((value, part) =>
                  value > 0 ? (
                    <span
                      key={part}
                      className="g-bar-chart-part"
                      data-series={part % 4}
                      style={{ height: `${(value / max) * 100}%` }}
                    />
                  ) : null,
                )}
              </div>
              <span className="g-bar-chart-label">{bar.label}</span>
            </div>
          ))}
        </div>
      )}
      {series.length > 1 && !(max === 0 && emptyMessage) && (
        <ul className="g-bar-chart-legend" aria-hidden="true">
          {series.map((item, index) => (
            <li key={item.label} data-series={index % 4}>
              {item.label}
            </li>
          ))}
        </ul>
      )}
      <table className="g-sr-only">
        <thead>
          <tr>
            <th scope="col">{label}</th>
            {series.map((item) => (
              <th key={item.label} scope="col">
                {item.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bars.map((bar, index) => (
            <tr key={`${bar.label}-${index}`}>
              <th scope="row">{bar.label}</th>
              {series.map((item, part) => (
                <td key={item.label}>{format(bar.values[part] ?? 0)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
