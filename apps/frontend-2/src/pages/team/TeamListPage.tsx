import { css } from "@emotion/css";
import { Add, Email } from "@navikt/ds-icons";
import { Button, ToggleGroup } from "@navikt/ds-react";
import * as React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { createTeam, getAllTeams } from "../../api";
import { useDash } from "../../components/dash/Dashboard";
import PageTitle from "../../components/PageTitle";
import ListView from "../../components/team/ListView";
import { TeamExport } from "../../components/team/TeamExport";
import type { ProductTeam, ProductTeamFormValues } from "../../constants";
import { user } from "../../services/User";

const TeamListPage = () => {
  const [teamList, setTeamList] = React.useState<ProductTeam[]>([]);
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [showContactAllModal, setShowContactAllModal] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string>();
  const [status, setStatus] = React.useState<string>("active");

  const dash = useDash();
  const navigate = useNavigate();

  const handleSubmit = async (values: ProductTeamFormValues) => {
    const createTeamResponse = await createTeam(values);
    if (createTeamResponse.id) {
      setTeamList([...teamList, createTeamResponse]);
      setShowModal(false);
      setErrorMessage("");
    } else {
      setErrorMessage(createTeamResponse);
    }
  };

  useEffect(() => {
    (async () => {
      const getAllTeamsResponse = await getAllTeams(status);
      if (getAllTeamsResponse.content) {
        setTeamList(getAllTeamsResponse.content);
      }
    })();
  }, [status]);

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
        <PageTitle title="Team" />

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
            onClick={() => navigate("/tree")}
            size="medium"
            variant="tertiary"
          >
            Team graf
          </Button>

          <TeamExport />
          {/* <ModalContactAllTeams teams={teamList} /> */}
          <Button
            className={css`
              margin-left: 1rem;
            `}
            icon={<Email />}
            onClick={() => setShowContactAllModal(true)}
            size="medium"
            variant="secondary"
          >
            Kontakt alle team
          </Button>

          {user.canWrite() && (
            <Button
              className={css`
                margin-left: 1rem;
              `}
              icon={<Add />}
              onClick={() => setShowModal(true)}
              size="medium"
              variant="secondary"
            >
              Opprett nytt team
            </Button>
          )}
        </div>
      </div>

      {teamList.length > 0 && <ListView list={teamList} prefixFilter="team" />}

      {/* {showModal && (
        <ModalTeam
          title="Opprett nytt team"
          isOpen={showModal}
          initialValues={mapProductTeamToFormValue()}
          errorMessage={errorMessage}
          submit={handleSubmit}
          onClose={() => {
            setShowModal(false)
            setErrorMessage('')
          }}
        />
      )} */}

      {/* Må hente inn modal for å kontakte alle teams også -- */}
    </React.Fragment>
  );
};

export default TeamListPage;
