import { css } from "@emotion/css";
import { Heading } from "@navikt/ds-react";
import type { ReactNode } from "react";
import React from "react";

import type { Member } from "../constants";
import { ResourceType } from "../constants";

export function MemberHeaderWithActions({
  title,
  members,
  children,
}: {
  title: string;
  members: Member[];
  children: ReactNode;
}) {
  const numberOfExternalMembers = (members ?? []).filter(
    (member) => member.resource.resourceType === ResourceType.EXTERNAL
  ).length;

  return (
    <div
      className={css`
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
      `}
    >
      <Heading level="2" size="medium">
        {title} ({members.length})
      </Heading>
      {numberOfExternalMembers > 0 && (
        <Heading level="3" size="small">
          Eksterne {numberOfExternalMembers} ({((numberOfExternalMembers / members.length) * 100).toFixed(0)}
          %)
        </Heading>
      )}

      <div
        className={css`
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        `}
      >
        {children}
      </div>
    </div>
  );
}
