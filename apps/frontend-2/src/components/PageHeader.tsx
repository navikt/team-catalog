import { css } from "@emotion/css";
import { Heading } from "@navikt/ds-react";
import type { ReactNode } from "react";

import type { Status } from "../constants";
import StatusField from "./StatusField";

export function PageHeader({ title, status, children }: { title: string; status?: Status; children?: ReactNode }) {
  return (
    <div
      className={css`
        display: flex;
        gap: 1rem;
        align-items: center;
      `}
    >
      <Heading level="1" size="large">
        {title}
      </Heading>
      {status && <StatusField status={status} />}
      <div
        className={css`
          flex: 1;
          justify-content: flex-end;
          display: flex;
          gap: 1rem;
        `}
      >
        {children}
      </div>
    </div>
  );
}
