import { MF_RISK_WARNING } from "@/lib/site";

export const SERIES_SWATCH = { invested: "#2f5597", gains: "#d9730d" };

/** The headline figure plus supporting rows. Rows with a swatch match the chart's series. */
export function ResultCard({
  label,
  value,
  rows,
  children,
}: {
  label: string;
  value: string;
  rows: { label: string; value: string; swatch?: string }[];
  children?: React.ReactNode;
}) {
  return (
    <section className="result-card" aria-live="polite" aria-label="Result">
      <p className="result-card__label">{label}</p>
      <p className="result-card__hero">{value}</p>
      <dl>
        {rows.map((row) => (
          <div key={row.label} className="result-card__row">
            <dt>
              {row.swatch && <span className="swatch" style={{ background: row.swatch }} aria-hidden="true" />}
              {row.label}
            </dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      {children}
    </section>
  );
}

export function IllustrativeNote({ children }: { children?: React.ReactNode }) {
  return (
    <p className="note">
      <strong>Illustrative only, not a guarantee of returns.</strong> This calculator assumes the rate you enter
      stays the same every year. Real mutual fund returns rise and fall, and you could get back less than you
      invest. {children} {MF_RISK_WARNING}
    </p>
  );
}
