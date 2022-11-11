import { css } from "@emotion/css";
import { EditFilled, FileFilled, ListFilled } from "@navikt/ds-icons";
import SvgBellFilled from "@navikt/ds-icons/esm/BellFilled";
import SvgEmailFilled from "@navikt/ds-icons/esm/EmailFilled";
import { Button, Heading } from "@navikt/ds-react";
import dayjs from "dayjs";
import sortBy from "lodash/sortBy";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { getProductArea, getTeam } from "../../api";
import { getProcessesForTeam } from "../../api/integrationApi";
import DescriptionSection from "../../components/common/DescriptionSection";
import Members from "../../components/common/Members";
import { ResourceInfoLayout } from "../../components/common/ResourceInfoContainer";
import { LargeDivider } from "../../components/Divider";
import { ErrorMessageWithLink } from "../../components/ErrorMessageWithLink";
import { LastModifiedBy } from "../../components/LastModifiedBy";
import { Markdown } from "../../components/Markdown";
import PageTitle from "../../components/PageTitle";
import StatusField from "../../components/StatusField";
import LocationSection from "../../components/team/LocationSection";
import ShortSummarySection from "../../components/team/ShortSummarySection";
import { ResourceType } from "../../constants";
import { Group, userHasGroup, userIsMemberOfTeam, useUser } from "../../hooks/useUser";
import { processLink } from "../../util/config";
import { intl } from "../../util/intl/intl";

const TeamPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const user = useUser();

  const teamQuery = useQuery({
    queryKey: [],
    queryFn: () => getTeam(teamId as string),
    enabled: !!teamId,
  });

  const team = teamQuery.data;

  const productAreaQuery = useQuery({
    queryKey: [getProductArea, team?.productAreaId],
    queryFn: () => getProductArea(team?.productAreaId as string),
    enabled: !!team?.productAreaId,
  });

  const processesQuery = useQuery({
    queryKey: [getProcessesForTeam, teamId],
    queryFn: () => getProcessesForTeam(teamId as string),
    select: (data) => sortBy(data, ["purposeName", "name"]),
    enabled: !!teamId,
  });

  const processes = processesQuery.data ?? [];

  dayjs.locale("nb");

  const getExternalLength = () =>
    team ? team?.members.filter((m) => m.resource.resourceType === ResourceType.EXTERNAL).length : 0;

  return (
    <div>
      {teamQuery.isError && (
        <ErrorMessageWithLink errorMessage={intl.teamNotFound} href="/team" linkText={intl.linkToAllTeamsText} />
      )}

      {team && (
        <>
          <div
            className={css`
              display: flex;
              justify-content: space-between;
              align-items: baseline;
            `}
          >
            <PageTitle title={team.name} />
          </div>

          <div
            className={css`
              display: flex;
              justify-content: space-between;
              margin-top: 2rem;
            `}
          >
            <StatusField status={team.status} />

            <div
              className={css`
                display: flex;
              `}
            >
              {/* {user.isAdmin() && <AuditButton id={team.id} marginRight />} -- Venter til adminviews er på plass */}

              {userHasGroup(user, Group.WRITE) && (
                <Button
                  className={css`
                    margin-right: 1rem;
                  `}
                  disabled
                  icon={<EditFilled aria-hidden />}
                  size="medium"
                  variant="secondary"
                >
                  {intl.edit}
                </Button>
              )}
              <Button
                className={css`
                  margin-right: 1rem;
                `}
                disabled
                icon={<SvgEmailFilled aria-hidden />}
                size="medium"
                variant="secondary"
              >
                Kontakt team
              </Button>
              <Button disabled icon={<SvgBellFilled aria-hidden />} size="medium" variant="secondary">
                Bli varslet
              </Button>
            </div>
          </div>

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
                <Button disabled icon={<ListFilled />} size="medium" variant="secondary">
                  Tabellvisning
                </Button>
              </div>
            </div>
            {/* {!showTable ? <MembersNew members={team.members} /> : <MemberTable members={team.members} />} -- Når medlemstabell er klar*/}
            <Members members={team.members} />
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
        </>
      )}
      <LastModifiedBy changeStamp={team?.changeStamp} />
    </div>
  );
};

export default TeamPage;
