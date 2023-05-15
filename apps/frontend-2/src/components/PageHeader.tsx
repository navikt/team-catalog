import { css } from "@emotion/css";
import { Heading } from "@navikt/ds-react";
import type { ReactNode } from "react";

import type { Status } from "../constants";
import { StatusField } from "./StatusField";

export function PageHeader({ title, status, children }: { title: string; status?: Status; children?: ReactNode }) {
  return (
    <div
      className={css`
        display: flex;
        gap: 1rem;
        align-items: center;
        flex-wrap: wrap;
        margin-bottom: 1.5rem;
        
        > :nth-last-child(2) {
          flex:1
        }
        
        h1 {
          white-space: nowrap;
        }
      `}
    >
      {status && <StatusField status={status} />}
      <Heading level="1" size="large">
        {title}
      </Heading>
      <div
        className={css`
          display: flex;
          gap: 1rem;
        `}
      >
        {children}
      </div>
    </div>
  );
}
