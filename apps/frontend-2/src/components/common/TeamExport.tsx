import { css } from "@emotion/css";
import { FileFilled } from "@navikt/ds-icons";
import { Button } from "@navikt/ds-react";
import { useParams } from "react-router-dom";

import { env } from "../../util/env";

export const TeamExport = () => {
  const { clusterId, productAreaId } = useParams();
  return (
    <a
      className={css`
        text-decoration: none;
      `}
      href={`${env.teamCatalogBaseUrl}/team/export/${
        productAreaId === undefined
          ? clusterId === undefined
            ? "ALL"
            : `CLUSTER?id=${clusterId}`
          : `AREA?id=${productAreaId}`
      }`}
    >
      <Button icon={<FileFilled />} size="medium" variant="secondary">
        Eksporter team
      </Button>
    </a>
  );
};
