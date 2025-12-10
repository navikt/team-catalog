import { css } from "@emotion/css";

import christmaslights from "../assets/Christmaslights.svg";

export function ChristmasBanner() {
  return (
    <div
      className={css`
        width: 100%;
        left: 0;
        position: absolute;
        height: 60px;
        overflow: hidden;
        z-index: -1;
        background-image: url(${christmaslights});
        background-repeat: repeat-x;
        background-size: auto 100%;
      `}
    />
  );
}
