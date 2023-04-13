import { css } from "@emotion/css";
import { AddCircleFilled, EmailFilled } from "@navikt/ds-icons";
import { Button, ToggleGroup } from "@navikt/ds-react";
import inRange from "lodash/inRange";
import sumBy from "lodash/sumBy";
import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { createTeam, mapProductTeamToFormValue } from "../../api";
import { getSlackUserByEmail } from "../../api/ContactAddressApi";
import { getExternalPercentage } from "../../components/Charts/TeamExternalChart";
import { TeamExport } from "../../components/common/TeamExport";
import { PageHeader } from "../../components/PageHeader";
import ListView from "../../components/team/ListView";
import ModalContactAllTeams from "../../components/team/ModalContactAllTeams";
import ModalTeam from "../../components/team/ModalTeam";
import type { ContactAddress, ProductTeam, ProductTeamSubmitValues, TeamOwnershipType } from "../../constants";
import { AddressType, Status } from "../../constants";
import { Group, useAllTeams, userHasGroup, useUser } from "../../hooks";
import { TeamsTable } from "./TeamsTable";

const TeamListPage = () => {
  const user = useUser();
  const [searchParameters, setSearchParameters] = useSearchParams();
  const [showTable, setShowTable] = useState(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showContactAllModal, setShowContactAllModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    if (!searchParameters.get("status")) {
      setSearchParameters((previous) => {
        previous.set("status", Status.ACTIVE);
        return previous;
      });
    }
  }, []);

  const teamQuery = useAllTeams({});
  const teamsBeforeStatusFilter = applyFilter(teamQuery.data ?? []);

  const teamsAfterStatusFilter = teamsBeforeStatusFilter.filter(
    (team) => team.status === searchParameters.get("status")
  );

  const navigate = useNavigate();

  const handleSubmit = async (values: ProductTeamSubmitValues) => {
    let mappedContactUsers: ContactAddress[] = [];
    const contactAddressesWithoutMail = values.contactAddresses.filter((ca) => !ca.email);

    const filteredUsersWithAddressId = values.contactAddresses
      .filter((ca) => ca.type === AddressType.SLACK_USER)
      .filter((ca) => ca.email)
      .map(async (contactUser) => await getSlackUserByEmail(contactUser.email || ""));
    try {
      const resolvedSlackUsersByEmail = await Promise.all(filteredUsersWithAddressId);
      mappedContactUsers = resolvedSlackUsersByEmail.map((user) => ({
        address: user.id,
        type: AddressType.SLACK_USER,
        slackChannel: { id: user.id, name: user.name },
      }));
    } catch {
      mappedContactUsers = [];
    }

    const response = await createTeam({
      ...values,
      contactAddresses: [...contactAddressesWithoutMail, ...mappedContactUsers],
    });
    if (response.id) {
      setShowModal(false);
      navigate(`/team/${response.id}`);
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
            onChange={(value) =>
              setSearchParameters((previous) => {
                previous.set("status", value);
                return previous;
              })
            }
            size="small"
            value={searchParameters.get("status") ?? Status.ACTIVE}
          >
            <ToggleGroup.Item value={Status.ACTIVE}>
              Aktive ({teamsBeforeStatusFilter.filter((team) => team.status === Status.ACTIVE).length})
            </ToggleGroup.Item>
            <ToggleGroup.Item value={Status.PLANNED}>
              Fremtidige ({teamsBeforeStatusFilter.filter((team) => team.status === Status.PLANNED).length})
            </ToggleGroup.Item>
            <ToggleGroup.Item value={Status.INACTIVE}>
              Inaktive ({teamsBeforeStatusFilter.filter((team) => team.status === Status.INACTIVE).length})
            </ToggleGroup.Item>
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
              icon={<EmailFilled />}
              onClick={() => setShowContactAllModal(true)}
              size="medium"
              variant="secondary"
            >
              Kontakt alle team
            </Button>

            {userHasGroup(user, Group.WRITE) && (
              <Button icon={<AddCircleFilled />} onClick={() => setShowModal(true)} size="medium" variant="secondary">
                Opprett nytt team
              </Button>
            )}
          </div>
        </div>
      </div>

      {teamsAfterStatusFilter.length > 0 && !showTable && (
        <ListView list={teamsAfterStatusFilter} prefixFilter="team" />
      )}
      <ModalTeam
        initialValues={mapProductTeamToFormValue()}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmitForm={(values: ProductTeamSubmitValues) => handleSubmit(values)}
        title="Opprett nytt team"
      />

      {showTable && <TeamsTable teams={teamsAfterStatusFilter} />}
      {/* Må hente inn modal for å kontakte alle teams også -- */}
      <ModalContactAllTeams
        isOpen={showContactAllModal}
        onClose={() => setShowContactAllModal(false)}
        teams={teamsAfterStatusFilter}
        title={"Kontakt alle teamene"}
      />
    </React.Fragment>
  );
};

function applyFilter(teams: ProductTeam[]) {
  const [searchParameters] = useSearchParams();

  let filteredTeams = teams;

  const teamOwnershipType = searchParameters.get("teamOwnershipType");
  if (teamOwnershipType) {
    filteredTeams = filteredTeams.filter((team) => team.teamOwnershipType === (teamOwnershipType as TeamOwnershipType));
  }

  const percentageOfExternalLessThan = searchParameters.get("percentageOfExternalLessThan");
  if (percentageOfExternalLessThan) {
    filteredTeams = filteredTeams.filter((team) => getExternalPercentage(team) < Number(percentageOfExternalLessThan));
  }

  const percentageOfExternalGreaterThan = searchParameters.get("percentageOfExternalGreaterThan");
  if (percentageOfExternalGreaterThan) {
    filteredTeams = filteredTeams.filter(
      (team) => getExternalPercentage(team) > Number(percentageOfExternalGreaterThan)
    );
  }

  if (searchParameters.get("numberOfMembersLessThan") || searchParameters.get("numberOfMembersGreaterThan")) {
    filteredTeams = filteredTeams.filter((team) =>
      inRange(
        team.members.length,
        Number(searchParameters.get("numberOfMembersGreaterThan") ?? Number.NEGATIVE_INFINITY),
        Number(searchParameters.get("numberOfMembersLessThan") ?? Number.POSITIVE_INFINITY)
      )
    );
  }

  return filteredTeams;
}

export default TeamListPage;
