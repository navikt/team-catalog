import { css } from "@emotion/css";

const defaultDividerCss = css`
  width: 100%;
  height: 5px;
  border-radius: var(--navds-spacing-1);
  margin-top: var(--navds-spacing-2);
`;
export function LargeDivider() {
  return (
    <div
      className={css(
        defaultDividerCss,
        css`
          background: var(--navds-global-color-deepblue-50);
          margin: 3rem 0;
        `
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
          background: var(--navds-global-color-deepblue-600);
        `
      )}
    />
  );
}
