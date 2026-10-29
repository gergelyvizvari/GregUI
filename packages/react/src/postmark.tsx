'use client';

export interface PostmarkProps {
  /** Place name around the top of the ring, such as a town or event. */
  place: string;
  /** Pre-formatted date in the ring centre; format it with useFormat for the current locale. */
  date: string;
  /** Short line under the date, such as a year or a greeting. */
  detail?: string;
  /** Draws wavy cancellation lines beside the ring. Defaults to true. */
  cancellation?: boolean;
  /** Slight rotation, as if hand-stamped. Reduced-motion has no effect on this static tilt. */
  tilt?: boolean;
}
/**
 * Decorative ink postmark for postcards, envelopes and greetings. It never represents real postage
 * or a postal service mark. The text stays readable for assistive technology.
 */
export function Postmark({ place, date, detail, cancellation = true, tilt = true }: PostmarkProps) {
  return (
    <span className="g-postmark" data-tilt={tilt}>
      <span className="g-postmark-ring">
        <span className="g-postmark-place">{place}</span>
        <span className="g-postmark-date">{date}</span>
        {detail && <span className="g-postmark-detail">{detail}</span>}
      </span>
      {cancellation && (
        <svg className="g-postmark-waves" viewBox="0 0 96 48" aria-hidden="true" focusable="false">
          {[8, 20, 32, 44].map((y) => (
            <path key={y} d={`M0 ${y - 4}q12 -6 24 0t24 0t24 0t24 0`} />
          ))}
        </svg>
      )}
    </span>
  );
}
