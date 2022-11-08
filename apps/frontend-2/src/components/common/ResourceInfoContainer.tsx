import { css } from "@emotion/css";
import { Heading } from "@navikt/ds-react";
import type { ReactNode } from "react";

import { SmallDivider } from "../Divider";

export function ResourceInfoContainer({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      className={css`
        display: flex;
        flex-direction: column;
      `}
    >
      <Heading level="2" size="medium">
        {title}
      </Heading>
      <SmallDivider />
      <div
        className={css`
          padding: 20px;
          background: var(--navds-global-color-deepblue-50);
          display: flex;
          gap: var(--navds-spacing-4);
          flex-direction: column;
          flex: 1;
          border-radius: 0 0 5px 5px;
        `}
      >
        {children}
      </div>
    </div>
  );
}
