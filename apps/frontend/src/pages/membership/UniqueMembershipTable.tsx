import { css } from "@emotion/css";
import { Pagination, Table } from "@navikt/ds-react";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";

import { getResourceUnitsById } from "../../api/resourceApi";
import { UserImage } from "../../components/UserImage";
import { env } from "../../util/env";
import { intl } from "../../util/intl/intl";
import { linkWithUnderline } from "../../util/styles";
import type { Membership } from "./MembershipsPage";

export function UniqueMembershipTable({ memberships }: { memberships: Membership[] }) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 100;

  const membershipsOnPage = memberships.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader colSpan={2}>Navn</Table.ColumnHeader>
            <Table.ColumnHeader>Enhet</Table.ColumnHeader>
            <Table.ColumnHeader>Avdeling</Table.ColumnHeader>
            <Table.ColumnHeader>Type</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {membershipsOnPage.map((membership, index) => (
            <MemberRow key={index} membership={membership} />
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
          count={Math.ceil(membershipsOnPage.length / rowsPerPage)}
          onPageChange={setPage}
          page={page}
          size="medium"
        />
      </div>
    </>
  );
}

function MemberRow({ membership }: { membership: Membership }) {
  const navIdent = membership.member.navIdent;
  const name = membership.member.resource.fullName;
  const resourceType = membership.member.resource.resourceType;

  const fetchResourceUnitsQuery = useQuery({
    queryKey: ["getResourceById", navIdent],
    queryFn: () => getResourceUnitsById(navIdent),
  });

  // TODO - generalize NOM links, also found in ResourceOrgAffiliation
  const unit = (fetchResourceUnitsQuery.data?.units ?? [])[0];
  return (
    <Table.Row>
      <Table.DataCell>{<UserImage navIdent={navIdent} size="32px" />}</Table.DataCell>
      <Table.DataCell scope="row">
        <Link to={`/resource/${navIdent}`}>{name}</Link>
      </Table.DataCell>
      <Table.DataCell>
        {unit ? (
          <Link
            className={linkWithUnderline}
            rel="noopener noreferrer"
            target="_blank"
            to={env.isDev ? `https://nom.ekstern.dev.nav.no/org/${unit.nomid}` : `https://nom.nav.no/org/${unit.nomid}`}
          >
            {unit.name}
          </Link>
        ) : (
          "-"
        )}
      </Table.DataCell>
      <Table.DataCell>
        {unit ? (
          <Link
            className={linkWithUnderline}
            rel="noopener noreferrer"
            target="_blank"
            to={
              env.isDev
                ? `https://nom.ekstern.dev.nav.no/org/${unit.parentUnit?.nomid}`
                : `https://nom.nav.no/org/${unit.parentUnit?.nomid}`
            }
          >
            {unit.parentUnit?.name || ""}
          </Link>
        ) : (
          "-"
        )}
      </Table.DataCell>
      <Table.DataCell>{resourceType ? intl[resourceType] : "-"}</Table.DataCell>
    </Table.Row>
  );
}
