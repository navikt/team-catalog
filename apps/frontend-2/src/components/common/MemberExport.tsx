import { css } from "@emotion/css";
import { FileFilled } from "@navikt/ds-icons";
import { Button } from "@navikt/ds-react";

import { env } from "../../util/env";

export function MemberExportForArea({ areaId }: { areaId: string }) {
  return <MemberExport url={`AREA?=${areaId}`} />;
}

export function MemberExportForCluster({ clusterId }: { clusterId: string }) {
  return <MemberExport url={`CLUSTER?=${clusterId}`} />;
}

export function MemberExportForTeam({ teamId }: { teamId: string }) {
  return <MemberExport url={`TEAM?=${teamId}`} />;
}

export function MemberExportForRole({ role }: { role: string }) {
  return <MemberExport url={`ROLE?=${role}`} />;
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
      <Button icon={<FileFilled />} size="medium" variant="secondary">
        Eksporter personer
      </Button>
    </a>
  );
};
