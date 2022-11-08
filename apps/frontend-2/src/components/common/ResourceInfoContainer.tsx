import { css } from "@emotion/css";
import { Heading } from "@navikt/ds-react";
import type { ReactNode } from "react";

import { SmallDivider } from "../Divider";

export function ResourceInfoContainer({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <Heading level="2" size="medium">
        {title}
      </Heading>
      <SmallDivider />
      <div
        className={css`
          margin-top: var(--navds-spacing-4);
          display: flex;
          gap: var(--navds-spacing-4);
          flex-direction: column;
        `}
      >
        {children}
      </div>
    </div>
  );
}
