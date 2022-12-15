import { css } from "@emotion/css";
import { FileFilled } from "@navikt/ds-icons";
import { Button } from "@navikt/ds-react";
import { useParams } from "react-router-dom";

import { env } from "../../util/env";

export const MemberExport = () => {
  const { clusterId, areaId, teamId } = useParams();
  return (
    <a
      className={css`
        text-decoration: none;
      `}
      href={`${env.teamCatalogBaseUrl}/member/export/${
        areaId !== undefined
          ? `AREA?id=${areaId}`
          : clusterId !== undefined
          ? `CLUSTER?id=${clusterId}`
          : teamId !== undefined
          ? `TEAM?id=${teamId}`
          : "ALL"
      }`}
    >
      <Button icon={<FileFilled />} size="medium" variant="secondary">
        Eksporter personer
      </Button>
    </a>
  );
};
