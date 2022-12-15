import { css } from "@emotion/css";
import { FileFilled } from "@navikt/ds-icons";
import { Button } from "@navikt/ds-react";
import { useParams } from "react-router-dom";

import { env } from "../../util/env";

export const TeamExport = () => {
  const { clusterId, areaId } = useParams();
  console.log(clusterId, areaId);
  return (
    <a
      className={css`
        text-decoration: none;
      `}
      href={`${env.teamCatalogBaseUrl}/team/export/${
        areaId !== undefined ? `AREA?id=${areaId}` : clusterId !== undefined ? `CLUSTER?id=${clusterId}` : "ALL"
      }`}
    >
      <Button icon={<FileFilled />} size="medium" variant="secondary">
        Eksporter team
      </Button>
    </a>
  );
};
