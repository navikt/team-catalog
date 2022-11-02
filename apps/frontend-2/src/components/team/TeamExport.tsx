import { File } from "@navikt/ds-icons";
import { Button } from "@navikt/ds-react";

import { env } from "../../util/env";
import { theme } from "../../util/theme";

export const TeamExport = (properties: { productAreaId?: string; clusterId?: string }) => {
  const { productAreaId, clusterId } = properties;
  return (
    <a
      className={theme.linkHideUnderline}
      href={`${env.teamCatalogBaseUrl}/team/export/${
        productAreaId != undefined
          ? `AREA?id=${productAreaId}`
          : clusterId != undefined
          ? `CLUSTER?id=${clusterId}`
          : "ALL"
      }`}
    >
      <Button icon={<File />} size="medium" variant="secondary">
        Eksporter team
      </Button>
    </a>
  );
};
