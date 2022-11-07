import { css } from "@emotion/css";
import { BodyShort, Label } from "@navikt/ds-react";
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
      <BodyShort
        className={css`
          margin-top: 0.5em;
          color: ${color && color};
        `}
      >
        {text}
      </BodyShort>
    </div>
  );
};
