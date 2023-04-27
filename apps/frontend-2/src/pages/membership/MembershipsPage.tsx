import { css } from "@emotion/css";
import { EmailFilled } from "@navikt/ds-icons";
import { Button, Heading, Label } from "@navikt/ds-react";
import intersection from "lodash/intersection";
import uniqBy from "lodash/uniqBy";
import queryString from "query-string";
import React, { useState } from "react";
import { useLocation } from "react-router-dom";

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
import { ModalContactMembers } from "./ModalContactMembers";

export type Membership = {
  member: Member;
  team?: ProductTeam;
  area?: ProductArea;
  clusters?: Cluster[];
};

export function MembershipsPage() {
  const [showContactMembersModal, setShowContactMembersModal] = useState<boolean>(false);
  const memberships = useGetMemberships();
  const filteredMemberships = applyMembershipFilter(memberships);

  return (
    <>
      <ModalContactMembers
        isOpen={showContactMembersModal}
        memberships={filteredMemberships}
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
        <PageTitle memberships={filteredMemberships} />
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
      <MembershipTable memberships={filteredMemberships} />
    </>
  );
}

function ShowCorrectExportButton() {
  const searchParameters = queryString.parse(useLocation().search);

  const { role, type, productAreaId, clusterId } = searchParameters;
  const roles = [role].flat();

  if (roles.length === 1) {
    return <MemberExportForRole role={roles[0] as string} />;
  }

  if (typeof productAreaId === "string") {
    return <MemberExportForArea areaId={productAreaId} />;
  }

  if (typeof clusterId === "string") {
    return <MemberExportForCluster clusterId={clusterId} />;
  }

  if (type || roles.length > 1) {
    return <></>;
  }

  return <AllMemberExport />;
}

function PageTitle({ memberships }: { memberships: Membership[] }) {
  const searchParameters = queryString.parse(useLocation().search);

  const { role, type, productAreaId, clusterId } = searchParameters;
  const roles = [role].flat();
  const uniqueMembers = uniqBy(memberships, (membership) => membership.member.navIdent);

  const productAreasData = useAllProductAreas({ status: Status.ACTIVE }).data ?? [];
  const matchingProductAreaName = productAreasData.find((area) => area.id === productAreaId)?.name;

  const clustersData = useAllClusters({ status: Status.ACTIVE }).data ?? [];
  const matchingClusterName = clustersData.find((cluster) => cluster.id === clusterId)?.name;

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
        {role && <span>Rolle: {roles.map((role) => intl[role as TeamRole]).join(", ")}</span>}
        {type && <span>Type: {intl[type as ResourceType]}</span>}
        {matchingProductAreaName && <span>Område: {matchingProductAreaName}</span>}
        {matchingClusterName && <span>Klynge: {matchingClusterName}</span>}
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
  let filteredMemberships = memberships;

  const { role, type, productAreaId, clusterId } = queryString.parse(useLocation().search);

  if (role) {
    const roles = [role].flat();
    filteredMemberships = filteredMemberships.filter(
      (membership) => intersection(membership.member.roles, roles).length > 0
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
