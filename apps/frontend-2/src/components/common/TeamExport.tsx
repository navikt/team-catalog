import { css } from "@emotion/css";
import { FileExportFillIcon } from "@navikt/aksel-icons";
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
      <Button icon={<FileExportFillIcon aria-hidden />} size="medium" variant="secondary">
        Eksporter team
      </Button>
    </a>
  );
};
