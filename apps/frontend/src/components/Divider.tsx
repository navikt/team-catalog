import { css } from "@emotion/css";

const defaultDividerCss = css`
  width: 100%;
  height: 5px;
  border-radius: 4px 4px 0 0;
  margin-top: var(--ax-space-8);
`;
export function LargeDivider() {
  return (
    <div
      className={css(
        defaultDividerCss,
        css`
          background: var(--ax-brand-blue-100);
          margin: 3rem 0;
        `,
      )}
    />
  );
}

export function SmallDivider() {
  return (
    <div
      className={css(
        defaultDividerCss,
        css`
          background: var(--ax-brand-blue-700);
        `,
      )}
    />
  );
}
