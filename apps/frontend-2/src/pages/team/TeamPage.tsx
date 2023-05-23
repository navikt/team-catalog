import { css } from "@emotion/css";
import { EnvelopeClosedFillIcon, PencilFillIcon, PersonRectangleIcon, TableIcon } from "@navikt/aksel-icons";
import { Button, Heading, Link } from "@navikt/ds-react";
import sortBy from "lodash/sortBy";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { getSlackUserByEmail } from "../../api/ContactAddressApi";
import { getProcessesForTeam } from "../../api/integrationApi";
import { NotificationType } from "../../api/notificationApi";
import { getProductArea } from "../../api/productAreaApi";
import { editTeam, getTeam, mapProductTeamToFormValue } from "../../api/teamApi";
import { DescriptionSection } from "../../components/common/DescriptionSection";
import { MemberExportForTeam } from "../../components/common/MemberExport";
import { Members } from "../../components/common/Members";
import { MembersTable } from "../../components/common/MembersTable";
import { ResourceInfoLayout } from "../../components/common/ResourceInfoContainer";
import { LargeDivider } from "../../components/Divider";
import { LastModifiedBy } from "../../components/LastModifiedBy";
import { Markdown } from "../../components/Markdown";
import { MemberHeaderWithActions } from "../../components/MemberHeaderWithActions";
import { PageHeader } from "../../components/PageHeader";
import { SubscribeToUpdates } from "../../components/SubscribeToUpdates";
import { LocationSection } from "../../components/team/LocationSection";
import { ModalMembers } from "../../components/team/ModalMembers";
import { ModalTeam } from "../../components/team/ModalTeam";
import { ShortSummarySection } from "../../components/team/ShortSummarySection";
import type { ContactAddress, MemberFormValues, ProductTeamSubmitValues } from "../../constants";
import { AddressType, TeamOwnershipType } from "../../constants";
import { Group, userHasGroup, userIsMemberOfTeam, useUser } from "../../hooks";
import { processLink } from "../../util/config";
import { intl } from "../../util/intl/intl";
import { ModalContactTeam } from "./components/ModalContactTeam";

export const TeamPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const user = useUser();
  const [showMembersTable, setShowMembersTable] = useState(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showMemberModal, setShowMemberModal] = useState<boolean>(false);
  const [showContactTeamModal, setShowContactTeamModal] = useState<boolean>(false);

  const teamQuery = useQuery({
    queryKey: ["getTeam", teamId],
    queryFn: () => getTeam(teamId as string),
    enabled: !!teamId,
  });

  const team = teamQuery.data;

  const productAreaQuery = useQuery({
    queryKey: ["getProductArea", team?.productAreaId],
    queryFn: () => getProductArea(team?.productAreaId as string),
    enabled: !!team?.productAreaId,
  });

  const processesQuery = useQuery({
    queryKey: ["getProcessesForTeam", teamId],
    queryFn: () => getProcessesForTeam(teamId as string),
    select: (data) => sortBy(data, ["purposeName", "name"]),
    enabled: !!teamId,
  });

  const processes = processesQuery.data ?? [];

  const handleSubmit = async (values: ProductTeamSubmitValues) => {
    let mappedContactUsers: ContactAddress[];
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

    const editResponse = await editTeam({
      ...values,
      contactAddresses: [...contactAddressesWithoutMail, ...mappedContactUsers],
    });
    await teamQuery.refetch();
    await productAreaQuery.refetch();
    await processesQuery.refetch();
    if (editResponse.id) {
      setShowEditModal(false);
    }
  };

  const handleMemberSubmit = async (values: MemberFormValues[]) => {
    let officeHoursFormatted;

    if (team) {
      if (team.officeHours) {
        officeHoursFormatted = {
          locationCode: team.officeHours.location.code,
          days: team.officeHours.days,
          information: team.officeHours.information,
        };
      }

      const editResponse = await editTeam({
        ...team,
        teamOwnershipType: team.teamOwnershipType ?? TeamOwnershipType.UNKNOWN,
        members: values,
        officeHours: officeHoursFormatted,
      });
      await teamQuery.refetch();
      await productAreaQuery.refetch();
      await processesQuery.refetch();

      if (editResponse.id) {
        setShowEditModal(false);
      }
    }
  };

  useEffect(() => {
    if (team) {
      document.title = `Teamkatalogen - ${team.name}`;
    }
  }, [team]);

  if (!team) {
    return <></>;
  }

  return (
    <div>
      <PageHeader status={team.status} title={team.name}>
        {userHasGroup(user, Group.WRITE) && (
          <Button
            icon={<PencilFillIcon aria-hidden />}
            onClick={() => setShowEditModal(true)}
            size="medium"
            variant="secondary"
          >
            {intl.edit}
          </Button>
        )}
        <Button
          icon={<EnvelopeClosedFillIcon aria-hidden />}
          onClick={() => setShowContactTeamModal(true)}
          size="medium"
          variant="secondary"
        >
          Kontakt team
        </Button>
        <SubscribeToUpdates notificationType={NotificationType.TEAM} target={teamId} />
      </PageHeader>

      <ResourceInfoLayout expandFirstSection>
        <DescriptionSection header="Om oss" text={<Markdown source={team.description} />} />
        <ShortSummarySection
          contactAddresses={userIsMemberOfTeam(user, team) ? team.contactAddresses : []}
          productArea={productAreaQuery.data}
          team={team}
        />
        <LocationSection
          contactAddresses={userIsMemberOfTeam(user, team) ? team.contactAddresses : []}
          productArea={productAreaQuery.data}
          team={team}
        />
      </ResourceInfoLayout>

      <LargeDivider />

      <MemberHeaderWithActions members={team.members} title="Medlemmer">
        {userHasGroup(user, Group.WRITE) && (
          <Button
            icon={<PencilFillIcon aria-hidden />}
            onClick={() => setShowMemberModal(true)}
            size="medium"
            variant="secondary"
          >
            Endre medlemmer
          </Button>
        )}

        {teamId && <MemberExportForTeam teamId={teamId} />}
        <Button
          icon={showMembersTable ? <PersonRectangleIcon /> : <TableIcon />}
          onClick={() => setShowMembersTable((previousValue) => !previousValue)}
          size="medium"
          variant="secondary"
        >
          {showMembersTable ? "Kortvisning" : "Tabellvisning"}
        </Button>
      </MemberHeaderWithActions>
      {showMembersTable ? <MembersTable members={team.members} /> : <Members members={team.members} />}

      <LargeDivider />

      <div
        className={css`
          display: flex;
          flex-wrap: wrap;
          column-gap: 5rem;
          row-gap: 2rem;
        `}
      >
        <div>
          <Heading level="2" size="medium" spacing>
            Behandlinger i Behandlingskatalogen ({processes.length})
          </Heading>
          {processes.length === 0 && <span>Ingen behandlinger registrert i Behandlingskatalogen</span>}
          {processes.map((process) => (
            <Link href={processLink(process)} key={process.id} rel="noopener noreferrer" target="_blank">
              {process.purposeName + ": " + process.name}
            </Link>
          ))}
        </div>
        <div>
          <Heading level="2" size="medium" spacing>
            Risikovurderinger (ROS) i TryggNok
          </Heading>

          <Link
            href={`https://apps.powerapps.com/play/f8517640-ea01-46e2-9c09-be6b05013566?app=645&Teamkatalogen_TeamID=${team.id}`}
            rel={"noopener"}
            target={"_blank"}
          >
            Risikovurderinger for {team.name}
          </Link>
        </div>
      </div>
      <ModalTeam
        initialValues={mapProductTeamToFormValue(team)}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmitForm={(values: ProductTeamSubmitValues) => handleSubmit(values)}
        title="Rediger team"
      />
      <ModalMembers
        initialValues={mapProductTeamToFormValue(team).members}
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        onSubmitForm={(values: MemberFormValues[]) => handleMemberSubmit(values)}
        title={"Endre medlemmer"}
      />
      <ModalContactTeam
        isOpen={showContactTeamModal}
        onClose={() => setShowContactTeamModal(false)}
        team={team}
        title={"Kontakt team"}
      />
      <LastModifiedBy changeStamp={team.changeStamp} />
    </div>
  );
};
