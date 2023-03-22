import { css } from "@emotion/css";
import type { SortState } from "@navikt/ds-react";
import { Pagination, Table } from "@navikt/ds-react";
import capitalize from "lodash/capitalize";
import sortBy from "lodash/sortBy";
import { Fragment, useState } from "react";
import { Link } from "react-router-dom";

import { UserImage } from "../../components/UserImage";
import type { SimpleResource } from "../../constants";
import type { TeamRole } from "../../constants";
import { intl } from "../../util/intl/intl";
import type { Membership } from "../table/TablePage";

const HeaderGenerator = (properties: { memberships: Membership[]; role?: TeamRole; leaderIdent?: string }) => {
  const { role, leaderIdent, memberships } = properties;
  if (role) {
    return (
      <h1>
        Medlemmer - Rolle: {intl[role]} ({memberships.length})
      </h1>
    );
  } else if (leaderIdent) {
    return <h1>kommer snart</h1>;
  }
  return <h1>Medlemmer ({memberships.length})</h1>;
};
export function MembersTable({
  memberships,
  role,
  leaderIdent,
}: {
  memberships: Membership[];
  role?: TeamRole;
  leaderIdent?: string;
}) {
  const [sort, setSort] = useState<SortState | undefined>(undefined);
  const [page, setPage] = useState(1);
  const rowsPerPage = 4;

  console.log(memberships);
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

  const membersAsRowViewMembers = createMemberRowViewData(memberships);
  const sortedMembers = sort ? sortMembers({ members: membersAsRowViewMembers, sort }) : membersAsRowViewMembers;
  const sortedMembersSliced = sortedMembers.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (memberships.length === 0) {
    return <p>Ingen medlemmer i teamet.</p>;
  }
  return (
    <Fragment>
      <HeaderGenerator leaderIdent={leaderIdent} memberships={memberships} role={role} />
      <Table onSortChange={(sortKey) => handleSort(sortKey)} sort={sort}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell scope="col"> </Table.HeaderCell>
            <Table.ColumnHeader sortKey="name" sortable>
              Navn
            </Table.ColumnHeader>
            <Table.ColumnHeader sortKey="teamName" sortable>
              Team
            </Table.ColumnHeader>
            <Table.ColumnHeader sortKey="productAreaName" sortable>
              Område
            </Table.ColumnHeader>
            <Table.ColumnHeader sortKey="clusterName" sortable>
              Klynger
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
          {sortedMembersSliced.map((member, index) => (
            <MemberRow key={index} member={member} />
          ))}
        </Table.Body>
      </Table>
      <div
        className={css`
          margin-top: 1em;
          display: flex;
          justify-content: center;
        `}
      >
        <Pagination
          count={Math.ceil(sortedMembers.length / rowsPerPage)}
          onPageChange={setPage}
          page={page}
          size="medium"
        />
      </div>
    </Fragment>
  );
}

function sortMembers({ members, sort }: { members: ReturnType<typeof createMemberRowViewData>; sort: SortState }) {
  const { orderBy, direction } = sort;

  const sortedMembersAscending = sortBy(members, orderBy);
  const reversed = direction === "descending";

  return reversed ? sortedMembersAscending.reverse() : sortedMembersAscending;
}

function createMemberRowViewData(memberships: Membership[]) {
  return memberships.map((membership) => {
    const resourceType = membership.member.resource.resourceType;
    const team = membership.team;
    const productArea = membership.area;
    const cluster = membership.cluster;

    return {
      navIdent: membership.member.navIdent,
      name: membership.member.resource.fullName,
      teamName: team ? team.name : "-",
      teamId: team && team.id ? team.id : undefined,
      areaName: productArea ? productArea.name : "-",
      areaId: productArea && productArea.id ? productArea.id : undefined,
      clusterName: cluster ? cluster.name : "-",
      clusterId: cluster && cluster.id ? cluster.id : undefined,

      role: membership.member.roles.map((role) => intl[role]).join(", "),
      description: capitalize(membership.member.description),
      resourceType: resourceType ? intl[resourceType] : "-",
    };
  });
}

function MemberRow({ member }: { member: ReturnType<typeof createMemberRowViewData>[0] }) {
  const {
    navIdent,
    name,
    teamName,
    teamId,
    areaName,
    areaId,
    clusterName,
    clusterId,
    role,
    description,
    resourceType,
  } = member;

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
      {teamId ? (
        <Table.DataCell>
          <Link to={`/team/${teamId}`}>{teamName}</Link>
        </Table.DataCell>
      ) : (
        <Table.DataCell>{teamName}</Table.DataCell>
      )}
      {areaId ? (
        <Table.DataCell>
          <Link to={`/area/${areaId}`}>{areaName}</Link>
        </Table.DataCell>
      ) : (
        <Table.DataCell>{areaName}</Table.DataCell>
      )}
      {clusterId ? (
        <Table.DataCell>
          <Link to={`/cluster/${clusterId}`}>{clusterName}</Link>
        </Table.DataCell>
      ) : (
        <Table.DataCell>{clusterName}</Table.DataCell>
      )}
      <Table.DataCell>{role}</Table.DataCell>
      <Table.DataCell>{description || "-"}</Table.DataCell>
      <Table.DataCell>{resourceType}</Table.DataCell>
    </Table.Row>
  );
}
