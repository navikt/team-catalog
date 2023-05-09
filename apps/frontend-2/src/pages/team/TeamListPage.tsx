import { css } from "@emotion/css";
import { AddCircleFilled, EmailFilled } from "@navikt/ds-icons";
import { Button, Heading, ToggleGroup } from "@navikt/ds-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getSlackUserByEmail } from "../../api/ContactAddressApi";
import { createTeam, mapProductTeamToFormValue } from "../../api/teamApi";
import { TeamExport } from "../../components/common/TeamExport";
import { ListView } from "../../components/team/ListView";
import { ModalContactAllTeams } from "../../components/team/ModalContactAllTeams";
import { ModalTeam } from "../../components/team/ModalTeam";
import type { ContactAddress, ProductTeamSubmitValues } from "../../constants";
import { AddressType, Status } from "../../constants";
import { Group, useAllTeams, useDashboard, userHasGroup, useUser } from "../../hooks";
import { TeamsTable } from "./TeamsTable";

export const TeamListPage = () => {
  const user = useUser();
  const [showTable, setShowTable] = useState(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showContactAllModal, setShowContactAllModal] = useState<boolean>(false);
  const [status, setStatus] = useState<Status>(Status.ACTIVE);

  const teamQuery = useAllTeams({ status });
  const teams = teamQuery.data ?? [];

  const dash = useDashboard();
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
    }
  };

  useEffect(() => {
    document.title = `Teamkatalogen`;
  }, [teams]);

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
        <Heading level="1" size="large">
          Team
        </Heading>

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
            size="small"
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

      {teams.length > 0 && !showTable && <ListView list={teams} prefixFilter="team" />}
      <ModalTeam
        initialValues={mapProductTeamToFormValue()}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmitForm={(values: ProductTeamSubmitValues) => handleSubmit(values)}
        title="Opprett nytt team"
      />

      {showTable && <TeamsTable teams={teams} />}
      {/* Må hente inn modal for å kontakte alle teams også -- */}
      <ModalContactAllTeams
        isOpen={showContactAllModal}
        onClose={() => setShowContactAllModal(false)}
        teams={teams}
        title={"Kontakt alle teamene"}
      />
    </React.Fragment>
  );
};
