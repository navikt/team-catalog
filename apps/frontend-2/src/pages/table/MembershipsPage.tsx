import { css } from "@emotion/css";
import { EmailFilled } from "@navikt/ds-icons";
import { Button, Heading, Label } from "@navikt/ds-react";
import uniqBy from "lodash/uniqBy";
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  AllMemberExport,
  MemberExportForArea,
  MemberExportForCluster,
  MemberExportForRole,
} from "../../components/common/MemberExport";
import type { Cluster, Member, ProductArea, ProductTeam, ResourceType, TeamRole } from "../../constants";
import { Status } from "../../constants";
import { useAllClusters, useAllProductAreas, useAllTeams } from "../../hooks";
import { intl } from "../../util/intl/intl";
import { MembershipTable } from "./MembershipTable";
import ModalContactMembers from "./ModalContactMembers";

export type Membership = {
  member: Member;
  team?: ProductTeam;
  area?: ProductArea;
  clusters?: Cluster[];
};

export function MembershipsPage() {
  const [showContactMembersModal, setShowContactMembersModal] = useState<boolean>(false);
  const memberships = useGetMemberships();

  return (
    <>
      <ModalContactMembers
        isOpen={showContactMembersModal}
        memberships={memberships}
        onClose={() => setShowContactMembersModal(false)}
        title={"Kontakt alle medlemmer"}
      />
      <div
        className={css`
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        `}
      >
        <PageTitle memberships={memberships} />
        <div>
          <ShowCorrectExportButton />
          <Button
            className={css`
              margin-left: 1em;
            `}
            icon={<EmailFilled />}
            onClick={() => setShowContactMembersModal(true)}
            size="medium"
            variant="secondary"
          >
            Kontakt alle medlemmer
          </Button>
        </div>
      </div>
      <MembershipTable memberships={applyMembershipFilter(memberships)} />
    </>
  );
}

function ShowCorrectExportButton() {
  const [searchParameters] = useSearchParams();

  const { role, type, productAreaId, clusterId } = Object.fromEntries(searchParameters);

  if (role) {
    return <MemberExportForRole role={role} />;
  }

  if (productAreaId) {
    return <MemberExportForArea areaId={productAreaId} />;
  }

  if (clusterId) {
    return <MemberExportForCluster clusterId={clusterId} />;
  }

  if (type) {
    return <></>;
  }

  return <AllMemberExport />;
}

function PageTitle({ memberships }: { memberships: Membership[] }) {
  const [searchParameters] = useSearchParams();

  const role = searchParameters.get("role") as TeamRole;
  const resourceType = searchParameters.get("resourceType") as ResourceType;
  const uniqueMembers = uniqBy(memberships, (membership) => membership.member.navIdent);

  return (
    <div>
      <Heading level="1" size="large" spacing>
        {memberships.length} medlemskap
      </Heading>
      <Label as="span">{uniqueMembers.length} personer</Label>
      <div
        className={css`
          display: flex;
          gap: 0.5rem;
        `}
      >
        <span>{role ? `Rolle: ${intl[role]}` : ""}</span>
        <span>{resourceType ? `Type: ${intl[resourceType]}` : ""}</span>
      </div>
    </div>
  );
}

function useGetMemberships() {
  const teamsData = useAllTeams({ status: Status.ACTIVE }).data ?? [];
  const productAreasData = useAllProductAreas({ status: Status.ACTIVE }).data ?? [];
  const clustersData = useAllClusters({ status: Status.ACTIVE }).data ?? [];

  const allTeamMembers = teamsData.flatMap((team) =>
    team.members.map((member) => {
      const area = productAreasData.find(({ id }) => id === team.productAreaId);
      const clusters = clustersData.filter((cluster) => team.clusterIds.includes(cluster.id));

      return {
        area,
        member,
        team,
        clusters,
      };
    })
  );

  const allAreaMembers = productAreasData.flatMap((area) => area.members.map((member) => ({ member, area })));
  const allClusterMembers = clustersData.flatMap((cluster) =>
    cluster.members.map((member) => {
      const area = productAreasData.find(({ id }) => id === cluster.productAreaId);

      return {
        member,
        clusters: [cluster],
        area,
      };
    })
  );

  return [...allTeamMembers, ...allAreaMembers, ...allClusterMembers];
}

function applyMembershipFilter(memberships: Membership[]) {
  const [searchParameters] = useSearchParams();

  let filteredMemberships = memberships;

  const { role, type, productAreaId, clusterId } = Object.fromEntries(searchParameters);

  if (role) {
    filteredMemberships = filteredMemberships.filter((membership) =>
      membership.member.roles.includes(role as TeamRole)
    );
  }

  if (type) {
    filteredMemberships = filteredMemberships.filter(
      (membership) => membership.member.resource.resourceType === (type as ResourceType)
    );
  }

  if (productAreaId) {
    filteredMemberships = filteredMemberships.filter((membership) => membership.area?.id === productAreaId);
  }

  if (clusterId) {
    filteredMemberships = filteredMemberships.filter((membership) =>
      membership.clusters?.some((cluster) => cluster.id === clusterId)
    );
  }

  return filteredMemberships;
}
