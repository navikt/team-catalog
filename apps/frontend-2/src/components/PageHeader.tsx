import { css } from "@emotion/css";
import { Heading } from "@navikt/ds-react";
import type { ReactNode } from "react";

import type { Status } from "../constants";
import { ResourceType } from "../constants";
import StatusField from "./StatusField";
import ResourceField from "./ResourceField";

export function PageHeader({
  title,
  status,
  resourceType,
  children,
}: {
  title: string;
  status?: Status;
  resourceType?: ResourceType;
  children?: ReactNode;
}) {
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
      {resourceType == ResourceType.EXTERNAL && <ResourceField resourceType={resourceType} />}
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
