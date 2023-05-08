import { css } from "@emotion/css";
import { Heading, Table } from "@navikt/ds-react";
import React, { Fragment } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";

import type { Membership } from "../../api/resourceApi";
import { getAllMemberships, getResourceUnitsById } from "../../api/resourceApi";
import { LargeDivider } from "../../components/Divider";
import { UserImage } from "../../components/UserImage";
import type { Member, Resource } from "../../constants";
import { useTableSort } from "../../hooks/useTableSort";
import { intl } from "../../util/intl/intl";

export function ResourceIsLeaderForTable({ resource }: { resource: Resource }) {
  const { sort, sortDataBykey, handleSortChange } = useTableSort();

  const fetchResourceUnitsQuery = useQuery({
    queryKey: ["getResourceUnitsById", resource.navIdent],
    queryFn: () => getResourceUnitsById(resource.navIdent),
  });

  const members = fetchResourceUnitsQuery.data?.members ?? [];
  if (members.length === 0) {
    return <></>;
  }

  const sortedMembers = sortDataBykey(members, sort);

  return (
    <div>
      <LargeDivider />
      <Heading level="2" size="medium">
        Leder for ({members.length})
      </Heading>
      <Table onSortChange={(sortKey) => handleSortChange(sortKey)} sort={sort}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader colSpan={2} scope="col" sortKey="fullName" sortable>
              Navn
            </Table.ColumnHeader>
            <Table.HeaderCell scope="col">Rolle</Table.HeaderCell>
            <Table.ColumnHeader scope="col" sortKey="type" sortable>
              Type
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sortedMembers.map((member) => (
            <MemberRow key={member.navIdent} member={member} />
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}

function MemberRow({ member }: { member: Resource }) {
  const { navIdent, fullName, resourceType } = member;

  const fetchMemberships = useQuery({
    queryKey: ["getAllMemberships", navIdent],
    queryFn: () => getAllMemberships(navIdent),
  });

  const membershipData = fetchMemberships.data;

  if (!membershipData) {
    return <></>;
  }

  const data = formatForTableRow(navIdent, membershipData);

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
  const clusterMemberships = membership.clusters.map((cluster) => ({
    name: cluster.name,
    url: `/cluster/${cluster.id}`,
    role: getRoleFromMembersListAsString(cluster.members, navident),
  }));

  const teamMemberships = membership.teams.map((team) => ({
    name: team.name,
    url: `/team/${team.id}`,
    role: getRoleFromMembersListAsString(team.members, navident),
  }));

  const productAreaMemberships = membership.productAreas.map((productArea) => ({
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
