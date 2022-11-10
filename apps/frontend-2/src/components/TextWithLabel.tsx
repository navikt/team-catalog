import { css } from "@emotion/css";
import { Label } from "@navikt/ds-react";
import * as React from "react";

import type { Status } from "../constants";

export const TextWithLabel = (properties: {
  label: React.ReactNode;
  text: React.ReactNode;
  status?: Status;
  color?: string;
}) => {
  const { label, text, color } = properties;
  return (
    <div>
      <Label>{label}</Label>
      <br />
      <span
        className={css`
          margin-top: var(--navds-spacing-1);
          color: ${color && color};
        `}
      >
        {text}
      </span>
    </div>
  );
};
