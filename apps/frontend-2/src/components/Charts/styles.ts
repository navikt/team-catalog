import { css } from "@emotion/css";

export const RECTANGLE_HOVER = css`
  .recharts-cartesian-axis-tick:hover {
    cursor: pointer;

    path {
      fill: var(--a-deepblue-400);
    }
  }
  .recharts-bar-rectangle:hover {
    cursor: pointer;
    path {
      fill: var(--a-deepblue-400);
    }
  }
`;
