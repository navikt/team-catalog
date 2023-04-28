import { css, cx } from "@emotion/css";
import { Heading } from "@navikt/ds-react";
import maxBy from "lodash/maxBy";
import { Link } from "react-router-dom";

export type ChartRow = {
  label: string;
  value: number;
  percentage?: number;
  url?: string;
};

export function HorizontalBarChart({
  rows,
  title,
  className,
}: {
  rows: ChartRow[];
  title: string;
  className?: string;
}) {
  const data = normalizeData(rows);
  return (
    <div
      className={cx(
        css`
          background: #e6f1f8;
          padding: 1rem 2rem 2rem;
          width: 100%;
          border-radius: 10px;
        `,
        className
      )}
    >
      <Heading level="2" size="medium">
        {title}
      </Heading>
      <div
        className={css`
          gap: 2rem;
          display: grid;
          grid-template-columns: max-content 1fr;
          margin-top: 2rem;
        `}
      >
        {data.map((row) => {
          return (
            <div
              className={css`
                display: contents;

                a.bar-rectangle:hover {
                  background: var(--a-deepblue-300);
                }

                .bar-rectangle {
                  background: var(--a-deepblue-500);
                  width: ${row.normalizedPercentage}%;
                  border-radius: 5px;
                }

                a {
                  color: var(--a-gray-900);
                  text-decoration: none;
                  &:hover {
                    text-decoration: underline;
                  }
                }
              `}
              key={row.label}
            >
              {row.url ? <Link to={row.url}>{row.label}</Link> : <span>{row.label}</span>}
              <div
                className={css`
                  display: inline-flex;
                  gap: 1rem;
                `}
              >
                {row.url ? (
                  <Link aria-hidden className="bar-rectangle" tabIndex={-1} to={row.url} />
                ) : (
                  <span className="bar-rectangle" />
                )}
                <span>
                  {row.value}&nbsp;({row.percentage}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function normalize(value: number, max: number, min: number) {
  const normalizedValue = (value - min) / (max - min);

  return normalizedValue * 100;
}

function normalizeData(rows: ChartRow[]) {
  const maxValue = maxBy(rows, "value")?.value ?? 0;
  return rows.map((row) => ({ ...row, normalizedPercentage: normalize(row.value, maxValue, 0) }));
}
