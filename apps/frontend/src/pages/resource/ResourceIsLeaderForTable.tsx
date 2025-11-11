import { css } from "@emotion/css";
import { Heading, Loader, Table } from "@navikt/ds-react";
import { useQuery } from "@tanstack/react-query";
import React, { Fragment } from "react";
import { Link } from "react-router-dom";

import {getResourceUnitsById, Membership} from "../../api/resourceApi";
import { getAllResourceUnitsById } from "../../api/resourceApi";
import { getAllMembershipByArray } from "../../api/resourceApi";
import { LargeDivider } from "../../components/Divider";
import { UserImage } from "../../components/UserImage";
import type { Member, Resource } from "../../constants";
import { Status } from "../../constants";
import { useTableSort } from "../../hooks/useTableSort";
import { intl } from "../../util/intl/intl";

export function ResourceIsLeaderForTable({ resource }: { resource: Resource }) {
  const { sort, sortDataBykey, handleSortChange } = useTableSort({ orderBy: "fullName", direction: "ascending" });

  const fetchResourceUnitsQuery = useQuery({
    queryKey: ["getResourceUnitsById", resource.navIdent],
    queryFn: () => getResourceUnitsById(resource.navIdent),
  });

  const allNavidents = fetchResourceUnitsQuery.data?.members?.map((member) => member.navIdent) ?? [];

  const fetchAllMembershipsQuery = useQuery({
    queryKey: ["getAllMembershipByArray", allNavidents],
    queryFn: () => getAllMembershipByArray(allNavidents),
    enabled: allNavidents.length > 0,
  });

  const members = fetchResourceUnitsQuery.data?.members ?? [];
  const membershipsData = fetchAllMembershipsQuery.data ?? {};
  const memberships = new Map<string, Membership>(
    Object.entries(membershipsData).map(([navident, membership]) => [navident, membership as Membership]),
  );

  if (members.length === 0 || allNavidents.length === 0) {
    return <></>;
  }

  const sortedMembers = sortDataBykey(members, sort);

  if (fetchAllMembershipsQuery.isLoading) {
    return (
      <>
        <LargeDivider />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px",
          }}
        >
          <Loader size="3xlarge" title="Laster inn data..." />
        </div>
      </>
    );
  }

  return (
    <div>
      <LargeDivider />
      <Heading level="2" size="medium">
        Leder for ({members.length})
      </Heading>
      <div
        className={css`
          overflow-x: scroll;
        `}
      >
        <Table onSortChange={(sortKey) => handleSortChange(sortKey)} sort={sort}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader colSpan={2} scope="col" sortKey="fullName" sortable>
                Navn
              </Table.ColumnHeader>
              <Table.HeaderCell scope="col">Rolle</Table.HeaderCell>
              <Table.ColumnHeader scope="col" sortKey="resourceType" sortable>
                Type
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sortedMembers.map((member) => (
              <MemberRow key={member.navIdent} member={member} membership={memberships.get(member.navIdent)} />
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}

function MemberRow({ member, membership }: { member: Resource; membership: Membership | undefined }) {
  const { navIdent, fullName, resourceType } = member;

  if (!membership) {
    return <></>;
  }

  const data = formatForTableRow(navIdent, membership);

  return (
    <Table.Row>
      <Table.DataCell>
        <UserImage navIdent={navIdent} size="32px" />
      </Table.DataCell>
      <Table.HeaderCell scope="row">
        <Link to={`/resource/${navIdent}`}>{fullName}</Link>
      </Table.HeaderCell>
      <Table.DataCell>
        <div
          className={css`
            display: grid;
            grid-template-columns: max-content max-content;
            column-gap: 1rem;
          `}
        >
          {data.map((item) => (
            <Fragment key={item.name}>
              <Link to={item.url}>{item.name}</Link>
              <span>{item.role}</span>
            </Fragment>
          ))}
        </div>
      </Table.DataCell>
      <Table.DataCell>{intl[resourceType]}</Table.DataCell>
    </Table.Row>
  );
}

function formatForTableRow(navident: string, membership: Membership) {
  const clusterMemberships = membership.clusters
    .filter(({ status }) => status === Status.ACTIVE)
    .map((cluster) => ({
      name: cluster.name,
      url: `/cluster/${cluster.id}`,
      role: getRoleFromMembersListAsString(cluster.members, navident),
    }));

  const teamMemberships = membership.teams
    .filter(({ status }) => status === Status.ACTIVE)
    .map((team) => ({
      name: team.name,
      url: `/team/${team.id}`,
      role: getRoleFromMembersListAsString(team.members, navident),
    }));

  const productAreaMemberships = membership.productAreas
    .filter(({ status }) => status === Status.ACTIVE)
    .map((productArea) => ({
      name: productArea.name,
      url: `/area/${productArea.id}`,
      role: getRoleFromMembersListAsString(productArea.members, navident),
    }));

  return [...clusterMemberships, ...teamMemberships, ...productAreaMemberships];
}

function getRoleFromMembersListAsString(members: Member[], navident: string) {
  return members
    .find((member) => member.navIdent === navident)
    ?.roles.map((role) => intl[role])
    .join(", ");
}
