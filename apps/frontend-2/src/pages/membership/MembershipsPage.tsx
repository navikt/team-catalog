import { css } from "@emotion/css";
import { EnvelopeClosedFillIcon } from "@navikt/aksel-icons";
import { Button, Heading, Label } from "@navikt/ds-react";
import intersection from "lodash/intersection";
import uniqBy from "lodash/uniqBy";
import queryString from "query-string";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  AllMemberExport,
  MemberExportForArea,
  MemberExportForCluster,
  MemberExportForRole,
  MemberExportForTeam,
} from "../../components/common/MemberExport";
import type { Cluster, Member, ProductArea, ProductTeam } from "../../constants";
import { Status } from "../../constants";
import { useAllClusters, useAllProductAreas, useAllTeams } from "../../hooks";
import { convertToList, MembershipFilter } from "./MembershipFilter";
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

  useEffect(() => {
    document.title = `Teamkatalogen`;
  }, [memberships]);

  return (
    <>
      <div
        className={css`
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 1rem;

          h1 {
            white-space: nowrap;
          }
        `}
      >
        <PageTitle memberships={filteredMemberships} />
        <div
          className={css`
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
          `}
        >
          <ShowCorrectExportButton />
          <Button
            icon={<EnvelopeClosedFillIcon />}
            onClick={() => setShowContactMembersModal(true)}
            size="medium"
            variant="secondary"
          >
            Kontakt alle medlemmer
          </Button>
          <ModalContactMembers
            isOpen={showContactMembersModal}
            memberships={filteredMemberships}
            onClose={() => setShowContactMembersModal(false)}
            title={"Kontakt alle medlemmer"}
          />
        </div>
      </div>
      <MembershipFilter />
      <MembershipTable memberships={filteredMemberships} />
    </>
  );
}

function ShowCorrectExportButton() {
  const { roleAsList, productAreaIdAsList, clusterIdAsList, teamIdAsList } = useGetParsedSearchParameters();
  const { search } = useLocation();
  console.log(search);
  if (roleAsList.length === 1) {
    return <MemberExportForRole role={roleAsList[0]} />;
  }

  if (productAreaIdAsList.length === 1) {
    return <MemberExportForArea areaId={productAreaIdAsList[0]} />;
  }

  if (clusterIdAsList.length === 1) {
    return <MemberExportForCluster clusterId={clusterIdAsList[0]} />;
  }

  if (teamIdAsList.length === 1) {
    return <MemberExportForTeam teamId={teamIdAsList[0]} />;
  }

  if (!search) {
    return <AllMemberExport />;
  }

  return <></>;
}

function PageTitle({ memberships }: { memberships: Membership[] }) {
  const uniqueMembers = uniqBy(memberships, (membership) => membership.member.navIdent);

  return (
    <div>
      <Heading level="1" size="large" spacing>
        {memberships.length} medlemskap
      </Heading>
      <Label as="span">{uniqueMembers.length} personer</Label>
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

function useGetParsedSearchParameters() {
  const { role, type, productAreaId, clusterId, teamId } = queryString.parse(useLocation().search);
  const roleAsList = convertToList(role);
  const typeAsList = convertToList(type);
  const productAreaIdAsList = convertToList(productAreaId);
  const clusterIdAsList = convertToList(clusterId);
  const teamIdAsList = convertToList(teamId);

  return { roleAsList, typeAsList, productAreaIdAsList, clusterIdAsList, teamIdAsList };
}

function applyMembershipFilter(memberships: Membership[]) {
  let filteredMemberships = memberships;

  const { roleAsList, typeAsList, productAreaIdAsList, clusterIdAsList, teamIdAsList } = useGetParsedSearchParameters();

  if (roleAsList.length > 0) {
    filteredMemberships = filteredMemberships.filter(
      (membership) => intersection(membership.member.roles, roleAsList).length > 0
    );
  }

  if (typeAsList.length > 0) {
    filteredMemberships = filteredMemberships.filter((membership) =>
      typeAsList.includes(membership.member.resource.resourceType as string)
    );
  }

  if (productAreaIdAsList.length > 0) {
    filteredMemberships = filteredMemberships.filter((membership) =>
      productAreaIdAsList.includes(membership.area?.id ?? "")
    );
  }

  if (clusterIdAsList.length > 0) {
    filteredMemberships = filteredMemberships.filter(
      (membership) => intersection(membership.clusters?.map((cluster) => cluster.id) ?? [], clusterIdAsList).length > 0
    );
  }

  if (teamIdAsList.length > 0) {
    filteredMemberships = filteredMemberships.filter((membership) =>
      teamIdAsList.includes(membership.team?.id as string)
    );
  }

  return filteredMemberships;
}
