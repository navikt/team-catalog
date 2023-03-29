import { css } from "@emotion/css";
import { EditFilled, Profile, Table } from "@navikt/ds-icons";
import SvgBellFilled from "@navikt/ds-icons/esm/BellFilled";
import SvgEmailFilled from "@navikt/ds-icons/esm/EmailFilled";
import { Button, Heading } from "@navikt/ds-react";
import dayjs from "dayjs";
import sortBy from "lodash/sortBy";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { editTeam, getProductArea, getResourceById, getTeam, mapProductTeamToFormValue } from "../../api";
import { getSlackUserByEmail } from "../../api/ContactAddressApi";
import { getProcessesForTeam } from "../../api/integrationApi";
import DescriptionSection from "../../components/common/DescriptionSection";
import { MemberExport } from "../../components/common/MemberExport";
import Members from "../../components/common/Members";
import { MembersTable } from "../../components/common/MembersTable";
import { ResourceInfoLayout } from "../../components/common/ResourceInfoContainer";
import { LargeDivider } from "../../components/Divider";
import { ErrorMessageWithLink } from "../../components/ErrorMessageWithLink";
import { LastModifiedBy } from "../../components/LastModifiedBy";
import { Markdown } from "../../components/Markdown";
import { PageHeader } from "../../components/PageHeader";
import LocationSection from "../../components/team/LocationSection";
import ModalContactTeam from "../../components/team/ModalContactTeam";
import ModalMembers from "../../components/team/ModalMembers";
import ModalTeam from "../../components/team/ModalTeam";
import ShortSummarySection from "../../components/team/ShortSummarySection";
import type {
  ContactAddress,
  MemberFormValues,
  OfficeHoursFormValues,
  ProductTeamSubmitValues,
  Resource,
} from "../../constants";
import { AddressType } from "../../constants";
import { ResourceType } from "../../constants";
import { Group, userHasGroup, userIsMemberOfTeam, useUser } from "../../hooks";
import { processLink } from "../../util/config";
import { intl } from "../../util/intl/intl";

const TeamPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const user = useUser();
  const [showMembersTable, setShowMembersTable] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [contactPersonResource, setContactPersonResource] = useState<Resource>();
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

  dayjs.locale("nb");

  const getExternalLength = () =>
    team ? team?.members.filter((m) => m.resource.resourceType === ResourceType.EXTERNAL).length : 0;

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

    const editResponse = await editTeam({
      ...values,
      contactAddresses: [...contactAddressesWithoutMail, ...mappedContactUsers],
    });
    await teamQuery.refetch();
    await productAreaQuery.refetch();
    await processesQuery.refetch();
    if (editResponse.id) {
      setShowEditModal(false);

      setErrorMessage("");
    } else {
      setErrorMessage(editResponse);
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

      const editResponse = await editTeam({ ...team, members: values, officeHours: officeHoursFormatted });
      await teamQuery.refetch();
      await productAreaQuery.refetch();
      await processesQuery.refetch();

      if (editResponse.id) {
        setShowEditModal(false);

        setErrorMessage("");
      } else {
        setErrorMessage(editResponse);
      }
    }
  };

  useEffect(() => {
    (async () => {
      if (team) {
        if (team.contactPersonIdent) {
          const contactPersonResponse = await getResourceById(team.contactPersonIdent);
          setContactPersonResource(contactPersonResponse);
        } else {
          setContactPersonResource(undefined);
        }
      }
    })();
  }, [team]);

  return (
    <div>
      {teamQuery.isError && (
        <ErrorMessageWithLink errorMessage={intl.teamNotFound} href="/team" linkText={intl.linkToAllTeamsText} />
      )}

      {team && (
        <>
          <PageHeader status={team.status} title={team.name}>
            {userHasGroup(user, Group.WRITE) && (
              <Button
                icon={<EditFilled aria-hidden />}
                onClick={() => setShowEditModal(true)}
                size="medium"
                variant="secondary"
              >
                {intl.edit}
              </Button>
            )}
            <Button
              icon={<SvgEmailFilled aria-hidden />}
              onClick={() => setShowContactTeamModal(true)}
              size="medium"
              variant="secondary"
            >
              Kontakt team
            </Button>
            <Button disabled icon={<SvgBellFilled aria-hidden />} size="medium" variant="secondary">
              Bli varslet
            </Button>
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

          <div>
            <div
              className={css`
                display: flex;
                justify-content: space-between;
                margin-bottom: 2rem;
              `}
            >
              <div
                className={css`
                  display: flex;
                  align-items: center;
                `}
              >
                <Heading
                  className={css`
                    margin-right: 2rem;
                    margin-top: 0;
                  `}
                  level={"2"}
                  size="medium"
                >
                  Medlemmer ({team.members.length > 0 ? team.members.length : "0"})
                </Heading>
                <Heading
                  className={css`
                    margin-top: 0;
                    align-self: center;
                  `}
                  level={"3"}
                  size="small"
                >
                  Eksterne {getExternalLength()} (
                  {getExternalLength() > 0 ? ((getExternalLength() / team.members.length) * 100).toFixed(0) : "0"}
                  %)
                </Heading>
              </div>
              <div
                className={css`
                  display: flex;
                  gap: 1rem;
                `}
              >
                {userHasGroup(user, Group.WRITE) && (
                  <Button
                    icon={<EditFilled aria-hidden />}
                    onClick={() => setShowMemberModal(true)}
                    size="medium"
                    variant="secondary"
                  >
                    Endre medlemmer
                  </Button>
                )}

                <MemberExport />
                <Button
                  icon={showMembersTable ? <Profile /> : <Table />}
                  onClick={() => setShowMembersTable((previousValue) => !previousValue)}
                  size="medium"
                  variant="secondary"
                >
                  {showMembersTable ? "Kortvisning" : "Tabellvisning"}
                </Button>
              </div>
            </div>
            {showMembersTable ? <MembersTable members={team.members} /> : <Members members={team.members} />}
          </div>
          <LargeDivider />

          <div
            className={css`
              margin-bottom: 2rem;
            `}
          >
            <Heading level="2" size="medium">
              Behandlinger i behandlingskatalogen ({processes.length})
            </Heading>

            <div
              className={css`
                margin-top: 1rem;
                display: flex;
                flex-direction: column;
                width: max-content;
                gap: 0.5rem;
              `}
            >
              {processes.length === 0 && <span>Ingen behandlinger registrert i behandlingskatalogen</span>}
              {processes.map((process) => (
                <a href={processLink(process)} key={process.id} rel="noopener noreferrer" target="_blank">
                  {process.purposeName + ": " + process.name}
                </a>
              ))}
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
            contactPersonResource={contactPersonResource}
            isOpen={showContactTeamModal}
            onClose={() => setShowContactTeamModal(false)}
            team={team}
            title={"Kontakt team"}
          />
        </>
      )}
      <LastModifiedBy changeStamp={team?.changeStamp} />
    </div>
  );
};

export default TeamPage;
