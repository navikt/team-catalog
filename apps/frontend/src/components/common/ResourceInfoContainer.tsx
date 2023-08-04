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
          background: var(--a-deepblue-50);
          display: flex;
          gap: var(--a-spacing-6);
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

export function ResourceInfoLayout({
  children,
  expandFirstSection,
}: {
  children: ReactNode;
  expandFirstSection: boolean;
}) {
  return (
    <div
      className={css`
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;

        & > div {
          &:first-child {
            flex: ${expandFirstSection ? 3 : 2};
            word-break: break-word;
            min-width: 350px;
          }
          min-width: 250px;
          flex: 2;
        }
      `}
    >
      {children}
    </div>
  );
}
