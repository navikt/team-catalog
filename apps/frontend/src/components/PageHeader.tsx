import { css } from "@emotion/css";
import type { TagProps } from "@navikt/ds-react";
import { Heading, Tag } from "@navikt/ds-react";
import type { ReactNode } from "react";

import { Status } from "../constants";
import { intl } from "../util/intl/intl";

export function PageHeader({ title, status, children }: { title: string; status?: Status; children?: ReactNode }) {
  return (
    <div
      className={css`
        display: flex;
        gap: 1rem;
        align-items: center;
        flex-wrap: wrap;
        margin-bottom: 1.5rem;

        h1 {
          white-space: nowrap;
        }
      `}
    >
      <span
        className={css`
          display: flex;
          gap: 1rem;
          flex: 1;
          align-items: center;
        `}
      >
        <Heading level="1" size="large">
          {title}
        </Heading>
        <StatusTag status={status} />
      </span>
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

function StatusTag({ status }: { status?: Status }) {
  if (!status) {
    return;
  }

  let variant: TagProps["variant"] = "success";
  if (status === Status.INACTIVE) {
    variant = "error";
  }
  if (status === Status.PLANNED) {
    variant = "info";
  }

  return (
    <Tag
      className={css`
        width: max-content;
      `}
      variant={variant}
    >
      {intl[status]}
    </Tag>
  );
}
