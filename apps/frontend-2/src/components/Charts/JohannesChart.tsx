import { css } from "@emotion/css";
import { Heading } from "@navikt/ds-react";
import maxBy from "lodash/maxBy";
import { Link } from "react-router-dom";

type Row = {
  label: string;
  value: number;
  percentage: number;
  url: string;
};

export function JohannesChart({ rows, title }: { rows: Row[]; title: string }) {
  const data = normalizeData(rows);
  return (
    <div
      className={css`
        background: #e6f1f8;
        padding: 1rem 2rem 2rem;
        width: 100%;
      `}
    >
      <Heading level="2" size="medium" spacing>
        {title}
      </Heading>
      <div
        className={css`
          gap: 2rem;
          display: grid;
          grid-template-columns: max-content 1fr;
        `}
      >
        {data.map((row) => {
          return (
            <div
              className={css`
                display: contents;

                .bar-rectangle {
                  cursor: pointer;
                  background: var(--a-deepblue-500);
                  width: ${row.normalizedPercentage}%;
                  border-radius: 5px;

                  &:hover {
                    background: var(--a-deepblue-300);
                  }
                }

                a {
                  text-decoration: none;
                  &:hover {
                    text-decoration: underline;
                  }
                }
              `}
              key={row.label}
            >
              <Link to={row.url}>{row.label}</Link>
              <div
                className={css`
                  display: inline-flex;
                  gap: 1rem;
                `}
              >
                <Link aria-hidden className="bar-rectangle" tabIndex={-1} to={row.url} />
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

function normalizeData(rows: Row[]) {
  const maxValue = maxBy(rows, "value")?.value ?? 0;
  return rows.map((row) => ({ ...row, normalizedPercentage: normalize(row.value, maxValue, 0) }));
}
