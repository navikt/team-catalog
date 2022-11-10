import { FileFilled } from "@navikt/ds-icons";
import { Button } from "@navikt/ds-react";

import { env } from "../../util/env";

export const TeamExport = (properties: { productAreaId?: string; clusterId?: string }) => {
  const { productAreaId, clusterId } = properties;
  return (
    <a
      href={`${env.teamCatalogBaseUrl}/team/export/${
        productAreaId != undefined
          ? `AREA?id=${productAreaId}`
          : clusterId != undefined
          ? `CLUSTER?id=${clusterId}`
          : "ALL"
      }`}
    >
      <Button disabled icon={<FileFilled />} size="medium" variant="secondary">
        Eksporter team
      </Button>
    </a>
  );
};
