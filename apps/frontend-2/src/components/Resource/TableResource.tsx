import { css } from "@emotion/css";
import { BodyLong, Loader, Table } from "@navikt/ds-react";
import { Link } from "react-router-dom";

import { useAllTeams } from "../../api";
import type { ProductTeam, Resource } from "../../constants";
import { intl } from "../../util/intl/intl";
import { linkWithUnderline } from "../../util/styles";
import { UserImage } from "../UserImage";

type TableResourceProperties = {
  members: Resource[];
};

const TableResource = (properties: TableResourceProperties) => {
  const { members } = properties;
  const teams = useAllTeams();

  const displayTeams = (ident: string) => {
    if (!teams) return;

    const teamsMember = teams
      .map((t: ProductTeam) => ({
        id: t.id,
        name: t.name,
        roles: t.members.find((tm) => tm.navIdent === ident)?.roles,
      }))
      .filter((t) => !!t.roles?.length);

    if (!teamsMember) return;

    return (
      <>
        {teamsMember.map((tm) => (
          <div
            className={css`
              display: flex;
              align-items: center;
            `}
            key={tm.id}
          >
            <Link className={linkWithUnderline} to={`/team/${tm.id}`}>
              {tm.name}
            </Link>{" "}
            &nbsp; <BodyLong size="medium">- {tm.roles!.map((r) => intl[r]).join(", ")}</BodyLong>
          </div>
        ))}
      </>
    );
  };

  return (
    <>
      {!teams && <Loader size="medium" />}
      {members && teams && (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell align="left" scope="col"></Table.HeaderCell>
              <Table.HeaderCell align="left" scope="col">
                Navn
              </Table.HeaderCell>
              <Table.HeaderCell align="left" scope="col">
                Team
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {members.map((m, index) => {
              return (
                <Table.Row key={index + m.navIdent}>
                  <Table.DataCell>
                    <UserImage resource={m} size="35px" />
                  </Table.DataCell>
                  <Table.DataCell>{m.fullName}</Table.DataCell>
                  <Table.DataCell>{displayTeams(m.navIdent) || <Loader size="small" />}</Table.DataCell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      )}
    </>
  );
};

export default TableResource;
