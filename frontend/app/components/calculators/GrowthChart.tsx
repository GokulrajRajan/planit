"use client";

import { useEffect, useRef, useState } from "react";
import { formatINR, formatINRShort, niceTicks, type YearRow } from "@/lib/calculators";

// Validated with the dataviz palette checker against the chart surface (#fcfcfc): lightness band,
// chroma, colour-blind separation and 3:1 contrast all pass. Brand blue and a deeper brand orange.
const COLORS = { invested: "#2f5597", gains: "#d9730d" };
const INK = "#2d2a28";
const MUTED = "#686664";
const GRID = "#e4e2e1";
const SURFACE = "#fcfcfc";

const HEIGHT = 300;
const MARGIN = { top: 28, right: 16, bottom: 34, left: 64 };
const GAP = 2; // surface gap between the stacked segments

/** A bar segment with 4px rounded top corners and a square base. */
function topRounded(x: number, top: number, width: number, height: number) {
  const r = Math.min(4, width / 2, height);
  return `M${x} ${top + height}V${top + r}Q${x} ${top} ${x + r} ${top}H${x + width - r}Q${x + width} ${top} ${x + width} ${top + r}V${top + height}Z`;
}

function useWidth(ref: React.RefObject<HTMLElement | null>, fallback: number) {
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

/**
 * Stacked columns per year: amount invested (base) and estimated gains (top), with an optional target
 * line. Hover or arrow keys show a readout for a year; the table below holds every value.
 */
export function GrowthChart({
  rows,
  target,
  xLabel = (year) => `Year ${year}`,
  caption,
}: {
  rows: YearRow[];
  target?: { value: number; label: string };
  xLabel?: (year: number) => string;
  /** One sentence for screen readers describing what the chart shows. */
  caption: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const width = useWidth(wrapRef, 640);
  const [active, setActive] = useState<number | null>(null);
  if (!rows.length) return null;

  const plotWidth = Math.max(120, width - MARGIN.left - MARGIN.right);
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const maxValue = Math.max(...rows.map((row) => Math.max(row.value, row.invested)), target?.value ?? 0);
  const ticks = niceTicks(maxValue);
  const yMax = ticks[ticks.length - 1] || 1;
  const y = (value: number) => MARGIN.top + plotHeight - (value / yMax) * plotHeight;
  const band = plotWidth / rows.length;
  const barWidth = Math.min(24, band * 0.62);
  const center = (i: number) => MARGIN.left + band * (i + 0.5);
  // Show at most one x label per ~56px, always including the last year.
  const labelEvery = Math.max(1, Math.ceil(rows.length / Math.max(2, Math.floor(plotWidth / 56))));
  const last = rows[rows.length - 1];
  const activeRow = active === null ? null : rows[active];

  const pick = (clientX: number, svg: SVGSVGElement) => {
    const index = Math.floor((clientX - svg.getBoundingClientRect().left - MARGIN.left) / band);
    setActive(Math.min(rows.length - 1, Math.max(0, index)));
  };

  const readout = (row: YearRow) =>
    `${xLabel(row.year)}: estimated value ${formatINR(row.value)}, invested ${formatINR(row.invested)}, estimated gains ${formatINR(Math.max(0, row.value - row.invested))}`;

  return (
    <figure className="chart-card">
      <ul className="chart-legend">
        <li>
          <span className="swatch" style={{ background: COLORS.invested }} aria-hidden="true" />
          Amount invested
        </li>
        <li>
          <span className="swatch" style={{ background: COLORS.gains }} aria-hidden="true" />
          Estimated gains
        </li>
        {target && (
          <li>
            <span className="chart-legend__line" aria-hidden="true" />
            {target.label}
          </li>
        )}
      </ul>

      <div className="chart" ref={wrapRef}>
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={`${caption} Use the left and right arrow keys to read each year.`}
          tabIndex={0}
          onPointerMove={(event) => pick(event.clientX, event.currentTarget)}
          onPointerLeave={() => setActive(null)}
          onFocus={() => setActive((current) => current ?? rows.length - 1)}
          onBlur={() => setActive(null)}
          onKeyDown={(event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault();
            const step = event.key === "ArrowLeft" ? -1 : 1;
            setActive((current) => Math.min(rows.length - 1, Math.max(0, (current ?? rows.length - 1) + step)));
          }}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={MARGIN.left} x2={MARGIN.left + plotWidth} y1={y(tick)} y2={y(tick)} stroke={GRID} strokeWidth={1} />
              <text x={MARGIN.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" fontSize={12} fill={MUTED}>
                {formatINRShort(tick)}
              </text>
            </g>
          ))}

          {rows.map((row, i) => {
            const x = center(i) - barWidth / 2;
            const investedTop = y(row.invested);
            const valueTop = y(Math.max(row.value, row.invested));
            const gainsHeight = investedTop - valueTop - GAP;
            const showGains = gainsHeight >= 1;
            const dimmed = active !== null && active !== i;
            return (
              <g key={row.year} opacity={dimmed ? 0.45 : 1}>
                <path
                  d={
                    showGains
                      ? `M${x} ${y(0)}V${investedTop}H${x + barWidth}V${y(0)}Z`
                      : topRounded(x, investedTop, barWidth, y(0) - investedTop)
                  }
                  fill={COLORS.invested}
                />
                {showGains && <path d={topRounded(x, valueTop, barWidth, gainsHeight)} fill={COLORS.gains} />}
                {(i % labelEvery === (rows.length - 1) % labelEvery) && (
                  <text x={center(i)} y={HEIGHT - 12} textAnchor="middle" fontSize={12} fill={MUTED}>
                    {xLabel(row.year).replace(/^Year /, "")}
                  </text>
                )}
              </g>
            );
          })}

          {target && (
            <g>
              <line
                x1={MARGIN.left}
                x2={MARGIN.left + plotWidth}
                y1={y(target.value)}
                y2={y(target.value)}
                stroke={INK}
                strokeWidth={1.5}
              />
              <text
                x={MARGIN.left + 6}
                y={y(target.value) - 6}
                fontSize={12}
                fill={INK}
                stroke={SURFACE}
                strokeWidth={4}
                paintOrder="stroke"
              >
                {target.label}: {formatINRShort(target.value)}
              </text>
            </g>
          )}

          {/* The one direct label: where the final year ends up. */}
          <text
            x={center(rows.length - 1)}
            y={y(Math.max(last.value, last.invested)) - 8}
            textAnchor={rows.length > 1 ? "end" : "middle"}
            dx={rows.length > 1 ? barWidth / 2 : 0}
            fontSize={13}
            fontWeight={600}
            fill={INK}
            stroke={SURFACE}
            strokeWidth={4}
            paintOrder="stroke"
          >
            {formatINRShort(last.value)}
          </text>

          {activeRow && (
            <line
              x1={center(active!)}
              x2={center(active!)}
              y1={MARGIN.top}
              y2={y(0)}
              stroke={INK}
              strokeOpacity={0.25}
              strokeWidth={1}
              pointerEvents="none"
            />
          )}
        </svg>

        {activeRow && (
          <div
            className="chart-tooltip"
            style={{ left: Math.min(width - 100, Math.max(100, center(active!))), top: 0 }}
            aria-hidden="true"
          >
            <span className="chart-tooltip__title">{xLabel(activeRow.year)}</span>
            <strong>{formatINR(activeRow.value)}</strong>
            <span className="chart-tooltip__row">
              <i style={{ background: COLORS.invested }} />
              Invested <b>{formatINR(activeRow.invested)}</b>
            </span>
            <span className="chart-tooltip__row">
              <i style={{ background: COLORS.gains }} />
              Est. gains <b>{formatINR(Math.max(0, activeRow.value - activeRow.invested))}</b>
            </span>
          </div>
        )}
        <p className="sr-only" aria-live="polite">
          {activeRow ? readout(activeRow) : ""}
        </p>
      </div>

      <details className="chart-table">
        <summary>View year-by-year table</summary>
        <div className="chart-table__scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">{xLabel(1).startsWith("Year") ? "Year" : "Age"}</th>
                <th scope="col">Invested</th>
                <th scope="col">Est. gains</th>
                <th scope="col">Est. value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.year}>
                  <th scope="row">{xLabel(row.year).replace(/^(Year|Age) /, "")}</th>
                  <td>{formatINR(row.invested)}</td>
                  <td>{formatINR(Math.max(0, row.value - row.invested))}</td>
                  <td>{formatINR(row.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
