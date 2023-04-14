import { css } from "@emotion/css";
import { Table } from "@navikt/ds-react";
import React from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";

import type { Membership } from "../../api";
import { getAllMemberships, getResourceUnitsById } from "../../api";
import { UserImage } from "../../components/UserImage";
import type { Resource } from "../../constants";
import { intl } from "../../util/intl/intl";

export function ResourceIsLeaderForTable({ resource }: { resource: Resource }) {
  const fetchResourceUnitsQuery = useQuery({
    queryKey: ["getResourceUnitsById", resource.navIdent],
    queryFn: () => getResourceUnitsById(resource.navIdent),
  });

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell scope="col"> </Table.HeaderCell>
          <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
          <Table.HeaderCell scope="col">Rolle</Table.HeaderCell>
          <Table.HeaderCell scope="col">Team</Table.HeaderCell>
          <Table.HeaderCell scope="col">Område</Table.HeaderCell>
          <Table.HeaderCell scope="col">Type</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {fetchResourceUnitsQuery.data?.members.map((member) => (
          <MemberRow key={member.navIdent} member={member} />
        ))}
      </Table.Body>
    </Table>
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
