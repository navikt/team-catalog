import { css } from "@emotion/css";
import { AddCircleFilled, EmailFilled } from "@navikt/ds-icons";
import { Button, ToggleGroup } from "@navikt/ds-react";
import * as React from "react";
import { useQuery } from "react-query";

import { getAllTeams } from "../../api";
import { PageHeader } from "../../components/PageHeader";
import ListView from "../../components/team/ListView";
import { TeamExport } from "../../components/team/TeamExport";
import { useDashboard } from "../../hooks/useDashboard";
import { Group, userHasGroup, useUser } from "../../hooks/useUser";

const TeamListPage = () => {
  const [status, setStatus] = React.useState<string>("active");
  const user = useUser();

  const teamQuery = useQuery({
    queryKey: ["getAllTeams", status],
    queryFn: () => getAllTeams(status as string),
    select: (data) => data.content,
  });

  const teams = teamQuery.data ?? [];

  const dash = useDashboard();

  return (
    <React.Fragment>
      <div
        className={css`
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        `}
      >
        <PageHeader title="Team" />

        <div
          className={css`
            display: flex;
            align-items: end;
            flex-wrap: wrap;
          `}
        >
          <ToggleGroup
            className={css`
              margin-right: 1rem;
            `}
            onChange={(value) => setStatus(value)}
            size="medium"
            value={status}
          >
            <ToggleGroup.Item value="active">Aktive ({dash?.teamsCount})</ToggleGroup.Item>
            <ToggleGroup.Item value="planned">Fremtidige ({dash?.teamsCountPlanned})</ToggleGroup.Item>
            <ToggleGroup.Item value="inactive">Inaktive ({dash?.teamsCountInactive})</ToggleGroup.Item>
          </ToggleGroup>

          <Button
            className={css`
              margin-right: 1rem;
            `}
            disabled
            size="medium"
            variant="tertiary"
          >
            Team graf
          </Button>

          <TeamExport />

          <Button
            className={css`
              margin-left: 1rem;
            `}
            disabled
            icon={<EmailFilled />}
            size="medium"
            variant="secondary"
          >
            Kontakt alle team
          </Button>

          {userHasGroup(user, Group.WRITE) && (
            <Button
              className={css`
                margin-left: 1rem;
              `}
              disabled
              icon={<AddCircleFilled />}
              size="medium"
              variant="secondary"
            >
              Opprett nytt team
            </Button>
          )}
        </div>
      </div>

      {teams.length > 0 && <ListView list={teams} prefixFilter="team" />}

      {/* Må hente inn modal for å kontakte alle teams også -- */}
      {/* <ModalContactAllTeams teams={teamList} /> */}
    </React.Fragment>
  );
};

export default TeamListPage;
