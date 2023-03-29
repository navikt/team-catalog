import type { SortState } from "@navikt/ds-react";
import { Table } from "@navikt/ds-react";
import capitalize from "lodash/capitalize";
import sortBy from "lodash/sortBy";
import { useState } from "react";
import { Link } from "react-router-dom";

import type { Member, SimpleResource } from "../../constants";
import { intl } from "../../util/intl/intl";
import { UserImage } from "../UserImage";

export function MembersTable({ members }: { members: Member[] }) {
  const [sort, setSort] = useState<SortState | undefined>(undefined);

  const handleSort = (sortKey: string | undefined) => {
    if (sortKey) {
      setSort({
        orderBy: sortKey,
        direction: sort && sortKey === sort.orderBy && sort.direction === "ascending" ? "descending" : "ascending",
      });
    } else {
      setSort(undefined);
    }
  };

  const membersAsRowViewMembers = createMemberRowViewData(members);
  const sortedMembers = sort ? sortMembers({ members: membersAsRowViewMembers, sort }) : membersAsRowViewMembers;

  if (members.length === 0) {
    return <p>Ingen medlemmer i teamet.</p>;
  }
  return (
    <Table onSortChange={(sortKey) => handleSort(sortKey)} sort={sort}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell scope="col"> </Table.HeaderCell>
          <Table.ColumnHeader sortKey="name" sortable>
            Navn
          </Table.ColumnHeader>
          <Table.ColumnHeader sortKey="role" sortable>
            Rolle
          </Table.ColumnHeader>
          <Table.ColumnHeader sortKey="description" sortable>
            Annet
          </Table.ColumnHeader>
          <Table.ColumnHeader sortKey="resourceType" sortable>
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
  );
}

function sortMembers({ members, sort }: { members: ReturnType<typeof createMemberRowViewData>; sort: SortState }) {
  const { orderBy, direction } = sort;

  const sortedMembersAscending = sortBy(members, orderBy);
  const reversed = direction === "descending";

  return reversed ? sortedMembersAscending.reverse() : sortedMembersAscending;
}

function createMemberRowViewData(members: Member[]) {
  return members.map((member) => {
    const resourceType = member.resource.resourceType;

    return {
      navIdent: member.navIdent,
      name: member.resource.fullName,
      role: member.roles.map((role) => intl[role]).join(", "),
      description: capitalize(member.description),
      resourceType: resourceType ? intl[resourceType] : "-",
    };
  });
}

function MemberRow({ member }: { member: ReturnType<typeof createMemberRowViewData>[0] }) {
  const { navIdent, name, role, description, resourceType } = member;

  const resource: SimpleResource = {
    navIdent,
    fullName: name || navIdent,
  };
  return (
    <Table.Row key={navIdent}>
      <Table.DataCell>
        <UserImage resource={resource} size="32px" />
      </Table.DataCell>
      <Table.DataCell>
        <Link to={`/resource/${navIdent}`}>{name}</Link>
      </Table.DataCell>
      <Table.DataCell>{role}</Table.DataCell>
      <Table.DataCell>{description || "-"}</Table.DataCell>
      <Table.DataCell>{resourceType}</Table.DataCell>
    </Table.Row>
  );
}
