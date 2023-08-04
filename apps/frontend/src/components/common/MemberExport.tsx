import { css } from "@emotion/css";
import { FileExportFillIcon } from "@navikt/aksel-icons";
import { Button } from "@navikt/ds-react";

import { env } from "../../util/env";

export function MemberExportForArea({ areaId }: { areaId: string }) {
  return <MemberExport url={`AREA?id=${areaId}`} />;
}

export function MemberExportForCluster({ clusterId }: { clusterId: string }) {
  return <MemberExport url={`CLUSTER?id=${clusterId}`} />;
}

export function MemberExportForTeam({ teamId }: { teamId: string }) {
  return <MemberExport url={`TEAM?id=${teamId}`} />;
}

export function MemberExportForRole({ role }: { role: string }) {
  return <MemberExport url={`ROLE?id=${role}`} />;
}

export function AllMemberExport() {
  return <MemberExport url="ALL" />;
}

const MemberExport = ({ url }: { url: string }) => {
  return (
    <a
      className={css`
        text-decoration: none;
      `}
      href={`${env.teamCatalogBaseUrl}/member/export/${url}`}
    >
      <Button icon={<FileExportFillIcon aria-hidden />} size="medium" variant="secondary">
        Eksporter personer
      </Button>
    </a>
  );
};
