import { css } from "@emotion/css";
import { Heading } from "@navikt/ds-react";
import type { ReactNode } from "react";

import type { Membership } from "../api";
import type { Resource, Status } from "../constants";
import { ResourceType } from "../constants";
import UserBadges from "./common/UserBadges";
import ResourceField from "./ResourceField";
import StatusField from "./StatusField";

export function PageHeader({
  title,
  status,
  memberships,
  resource,
  resourceType,
  children,
}: {
  title: string;
  status?: Status;
  memberships?: Membership;
  resource: Resource;
  securityChampion?: boolean;
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
      {memberships && <UserBadges memberships={memberships} resource={resource} />}

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
