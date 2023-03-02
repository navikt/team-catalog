import "dayjs/plugin/localizedFormat";

import { css } from "@emotion/css";
import { EditFilled } from "@navikt/ds-icons";
import SvgBellFilled from "@navikt/ds-icons/esm/BellFilled";
import { Button, Heading } from "@navikt/ds-react";
import dayjs from "dayjs";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { getAllTeams } from "../../api";
import { getCluster } from "../../api";
import DescriptionSection from "../../components/common/DescriptionSection";
import { MemberExport } from "../../components/common/MemberExport";
import Members from "../../components/common/Members";
import { NumberOfPeopleInResource } from "../../components/common/NumberOfPeopleInResource";
import { ResourceInfoLayout } from "../../components/common/ResourceInfoContainer";
import { LargeDivider } from "../../components/Divider";
import { ErrorMessageWithLink } from "../../components/ErrorMessageWithLink";
import { LastModifiedBy } from "../../components/LastModifiedBy";
import { Markdown } from "../../components/Markdown";
import { PageHeader } from "../../components/PageHeader";
import { TeamsSection } from "../../components/team/TeamsSection";
import { ResourceType, Status } from "../../constants";
import { useDashboard } from "../../hooks";
import { Group, userHasGroup, useUser } from "../../hooks";
import { intl } from "../../util/intl/intl";
import ClusterSummarySection from "./ClusterSummarySection";

dayjs.locale("nb");

const ClusterPage = () => {
  const { clusterId } = useParams<{ clusterId: string }>();
  const user = useUser();
  const dash = useDashboard();

  const clustersQuery = useQuery({
    queryKey: ["getCluster", clusterId],
    queryFn: () => getCluster(clusterId as string),
    enabled: !!clusterId,
  });

  const allTeamsForClusterQuery = useQuery({
    queryKey: ["getAllTeamsForCluster", clusterId],
    queryFn: () => getAllTeams({ clusterId }),
    enabled: !!clusterId,
    select: (data) => data.content.filter((team) => team.status === Status.ACTIVE),
  });

  const cluster = clustersQuery.data;
  const clusterMembers = cluster?.members ?? [];
  const teams = allTeamsForClusterQuery.data ?? [];

  const numberOfExternalMembers = (cluster?.members ?? []).filter(
    (member) => member.resource.resourceType === ResourceType.EXTERNAL
  ).length;

  const clusterSummary = dash?.clusterSummaryMap[cluster?.id ?? ""];

  return (
    <div>
      {clustersQuery.isError && (
        <ErrorMessageWithLink
          errorMessage={intl.productAreaNotFound}
          href="/team"
          linkText={intl.linkToAllProductAreasText}
        />
      )}

      {cluster && (
        <>
          <PageHeader status={cluster.status} title={cluster.name}>
            {userHasGroup(user, Group.WRITE) && (
              <Button disabled icon={<EditFilled aria-hidden />} size="medium" variant="secondary">
                {intl.edit}
              </Button>
            )}
            <Button disabled icon={<SvgBellFilled aria-hidden />} size="medium" variant="secondary">
              Bli varslet
            </Button>
          </PageHeader>

          <NumberOfPeopleInResource
            numberOfExternals={clusterSummary?.uniqueResourcesExternal ?? 0}
            numberOfPeople={clusterSummary?.totalUniqueResourcesCount ?? 0}
            resourceNoun="klyngen"
          />

          <ResourceInfoLayout expandFirstSection={false}>
            <DescriptionSection header="Om oss" text={<Markdown source={cluster.description} />} />
            <ClusterSummarySection cluster={cluster} />
          </ResourceInfoLayout>
        </>
      )}
      <LargeDivider />
      <TeamsSection teams={teams} />
      <LargeDivider />
      <div
        className={css`
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
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
          Medlemmer på klyngenivå ({cluster?.members.length})
        </Heading>
        {numberOfExternalMembers > 0 && clusterMembers.length > 0 && (
          <Heading
            className={css`
              margin-top: 0;
              align-self: center;
              flex: 1;
            `}
            level={"3"}
            size="small"
          >
            Eksterne {numberOfExternalMembers} ({((numberOfExternalMembers / clusterMembers.length) * 100).toFixed(0)}
            %)
          </Heading>
        )}
        <MemberExport />
      </div>
      {clusterMembers.length > 0 ? <Members members={clusterMembers} /> : <></>}
      <LastModifiedBy changeStamp={cluster?.changeStamp} />
    </div>
  );
};

export default ClusterPage;
