import { css } from "@emotion/css";
import { Table } from "@navikt/ds-react";
import capitalize from "lodash/capitalize";
import { Link } from "react-router-dom";

import type { Member } from "../../constants";
import { useTableSort } from "../../hooks/useTableSort";
import { intl } from "../../util/intl/intl";
import { UserImage } from "../UserImage";

export function MembersTable({ members }: { members: Member[] }) {
  const { sort, sortDataBykey, handleSortChange } = useTableSort();

  const membersAsRowViewMembers = createMemberRowViewData(members);
  const sortedMembers = sortDataBykey(membersAsRowViewMembers, sort);

  if (members.length === 0) {
    return <p>Ingen medlemmer i teamet.</p>;
  }

  return (
    <div
      className={css`
        overflow-x: scroll;
      `}
    >
      <Table onSortChange={(sortKey) => handleSortChange(sortKey)} sort={sort}>
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
    </div>
  );
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

  return (
    <Table.Row key={navIdent}>
      <Table.DataCell>
        <UserImage navIdent={navIdent} size="32px" />
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
