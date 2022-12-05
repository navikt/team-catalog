import { css } from "@emotion/css";
import { EditFilled, FileFilled, Profile, Table } from "@navikt/ds-icons";
import SvgBellFilled from "@navikt/ds-icons/esm/BellFilled";
import SvgEmailFilled from "@navikt/ds-icons/esm/EmailFilled";
import { Button, Heading } from "@navikt/ds-react";
import dayjs from "dayjs";
import sortBy from "lodash/sortBy";
import { useState } from "react";
import { Simulate } from "react-dom/test-utils";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { editTeam, getProductArea, getTeam, mapProductTeamToFormValue } from "../../api";
import { getProcessesForTeam } from "../../api/integrationApi";
import DescriptionSection from "../../components/common/DescriptionSection";
import Members from "../../components/common/Members";
import { ResourceInfoLayout } from "../../components/common/ResourceInfoContainer";
import { LargeDivider } from "../../components/Divider";
import { ErrorMessageWithLink } from "../../components/ErrorMessageWithLink";
import { LastModifiedBy } from "../../components/LastModifiedBy";
import { Markdown } from "../../components/Markdown";
import { PageHeader } from "../../components/PageHeader";
import LocationSection from "../../components/team/LocationSection";
import ModalTeam from "../../components/team/ModalTeam";
import ShortSummarySection from "../../components/team/ShortSummarySection";
import type { ContactAddress, ProductTeamSubmitValues } from "../../constants";
import { ProductArea, ResourceType } from "../../constants";
import { Group, userHasGroup, userIsMemberOfTeam, useUser } from "../../hooks/useUser";
import { processLink } from "../../util/config";
import { intl } from "../../util/intl/intl";
import { MembersTable } from "./MembersTable";
import submit = Simulate.submit;

const TeamPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const user = useUser();
  const [showMembersTable, setShowMembersTable] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [contactAddresses, setContactAddresses] = useState<ContactAddress[]>();
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

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

  const productArea = productAreaQuery.data;

  const processes = processesQuery.data ?? [];

  dayjs.locale("nb");

  const getExternalLength = () =>
    team ? team?.members.filter((m) => m.resource.resourceType === ResourceType.EXTERNAL).length : 0;

  const handleSubmit = async (values: ProductTeamSubmitValues) => {
    const editResponse = await editTeam(values);
    teamQuery.refetch()
    productAreaQuery.refetch()
    processesQuery.refetch()
    if (editResponse.id) {
      setShowEditModal(false);
      
      setErrorMessage("");
    } else {
      setErrorMessage(editResponse);
    }
  };

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
            <Button disabled icon={<SvgEmailFilled aria-hidden />} size="medium" variant="secondary">
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
                  size="medium"
                >
                  Medlemmer ({team.members.length > 0 ? team.members.length : "0"})
                </Heading>
                <Heading
                  className={css`
                    margin-top: 0;
                    align-self: center;
                  `}
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
                `}
              >
                <Button
                  className={css`
                    margin-right: 1rem;
                  `}
                  disabled
                  icon={<FileFilled />}
                  size="medium"
                  variant="secondary"
                >
                  Eksporter medlemmer
                </Button>
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
        </>
      )}
      <LastModifiedBy changeStamp={team?.changeStamp} />
    </div>
  );
};

export default TeamPage;
