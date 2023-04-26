import { css } from "@emotion/css";
import { Heading, Table } from "@navikt/ds-react";
import React from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";

import type { Membership } from "../../api/resourceApi";
import { getAllMemberships, getResourceUnitsById } from "../../api/resourceApi";
import { LargeDivider } from "../../components/Divider";
import { UserImage } from "../../components/UserImage";
import type { Resource } from "../../constants";
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
            <Table.ColumnHeader colSpan={2} scope="col" sortKey="name" sortable>
              Navn
            </Table.ColumnHeader>
            <Table.HeaderCell scope="col">Rolle</Table.HeaderCell>
            <Table.HeaderCell scope="col">Team</Table.HeaderCell>
            <Table.HeaderCell scope="col">Område</Table.HeaderCell>
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
        <Vertical items={data.map((d) => d.role ?? "")} />
      </Table.DataCell>
      <Table.DataCell>
        <Vertical items={data.map((d) => d.teamName ?? "")} />
      </Table.DataCell>
      <Table.DataCell>
        <Vertical items={data.map((d) => d.productAreaName ?? "")} />
      </Table.DataCell>
      <Table.DataCell>{intl[resourceType]}</Table.DataCell>
    </Table.Row>
  );
}

function Vertical({ items }: { items: string[] }) {
  return (
    <div
      className={css`
        display: flex;
        flex-direction: column;
      `}
    >
      {items.map((item, index) => (
        <span key={index}>{item}</span>
      ))}
    </div>
  );
}

function formatForTableRow(navident: string, membership: Membership) {
  return membership.teams.map((team) => {
    const member = team.members.find((member) => member.navIdent === navident);
    const productArea = membership.productAreas.find((pa) => pa.id === team.productAreaId);

    return {
      role: member?.roles.map((role) => intl[role]).join(", "),
      teamName: team.name,
      productAreaName: productArea?.name,
    };
  });
}
