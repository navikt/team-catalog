import { css } from "@emotion/css";
import { AddCircleFilled, EmailFilled } from "@navikt/ds-icons";
import { Button, ToggleGroup } from "@navikt/ds-react";
import * as React from "react";
import { useState } from "react";

import { createTeam, mapProductTeamToFormValue } from "../../api/teamApi";
import { PageHeader } from "../../components/PageHeader";
import ListView from "../../components/team/ListView";
import { TeamExport } from "../../components/team/TeamExport";
import type { ProductTeam, ProductTeamFormValues } from "../../constants";
import { Status, TeamOwnershipType, TeamType } from "../../constants";
import { useAllTeams } from "../../hooks/useAllTeams";
import { useDashboard } from "../../hooks/useDashboard";
import { Group, userHasGroup, useUser } from "../../hooks/useUser";
import { TeamsTable } from "./TeamsTable";
import ModalTeam from "../../components/team/ModalTeam";

const TeamListPage = () => {
  const user = useUser();
  const [status, setStatus] = useState<Status>(Status.ACTIVE);
  const [showTable, setShowTable] = useState(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showContactAllModal, setShowContactAllModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const teamQuery = useAllTeams({ status });

  const teams = teamQuery.data ?? [];

  const dash = useDashboard();

  const handleSubmit = async (values: ProductTeamFormValues) => {
    const response = await createTeam(values);
    if (response.id) {
      setShowModal(false);
      setErrorMessage("");
    } else {
      setErrorMessage(response);
    }
  };

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
            onChange={(value) => setStatus(value as Status)}
            size="medium"
            value={status}
          >
            <ToggleGroup.Item value={Status.ACTIVE}>Aktive ({dash?.teamsCount})</ToggleGroup.Item>
            <ToggleGroup.Item value={Status.PLANNED}>Fremtidige ({dash?.teamsCountPlanned})</ToggleGroup.Item>
            <ToggleGroup.Item value={Status.INACTIVE}>Inaktive ({dash?.teamsCountInactive})</ToggleGroup.Item>
          </ToggleGroup>

          <div
            className={css`
              display: flex;
              gap: 1rem;
            `}
          >
            <Button onClick={() => setShowTable((previousValue) => !previousValue)} size="medium" variant="secondary">
              {showTable ? "Listevisning" : "Tabellvisning"}
            </Button>
            <TeamExport />
            <Button
              disabled
              icon={<EmailFilled />}
              onClick={() => setShowContactAllModal(true)}
              size="medium"
              variant="secondary"
            >
              Kontakt alle team
            </Button>

            {userHasGroup(user, Group.WRITE) && (
              <Button
                disabled
                icon={<AddCircleFilled />}
                onClick={() => setShowModal(true)}
                size="medium"
                variant="secondary"
              >
                Opprett nytt team
              </Button>
            )}
          </div>
        </div>
      </div>

      {teams.length > 0 && !showTable && <ListView list={teams} prefixFilter="team" />}
      <ModalTeam
        initialValues={mapProductTeamToFormValue()}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmitForm={(values: ProductTeamFormValues) => handleSubmit(values)}
        title="Opprett nytt team"
      />

      {showTable && <TeamsTable teams={teams} />}
      {/* Må hente inn modal for å kontakte alle teams også -- */}
      {/* <ModalContactAllTeams teams={teamList} /> */}
    </React.Fragment>
  );
};

export default TeamListPage;
