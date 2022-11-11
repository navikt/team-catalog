import "dayjs/plugin/localizedFormat";

import { css } from "@emotion/css";
import { EditFilled } from "@navikt/ds-icons";
import SvgBellFilled from "@navikt/ds-icons/esm/BellFilled";
import { Button, Heading } from "@navikt/ds-react";
import dayjs from "dayjs";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { getAllTeamsForCluster } from "../../api";
import { getCluster } from "../../api/clusterApi";
import DescriptionSection from "../../components/common/DescriptionSection";
import Members from "../../components/common/Members";
import { ResourceInfoLayout } from "../../components/common/ResourceInfoContainer";
import { LargeDivider } from "../../components/Divider";
import { ErrorMessageWithLink } from "../../components/ErrorMessageWithLink";
import { LastModifiedBy } from "../../components/LastModifiedBy";
import { Markdown } from "../../components/Markdown";
import PageTitle from "../../components/PageTitle";
import StatusField from "../../components/StatusField";
import { TeamsSection } from "../../components/team/TeamsSection";
import { ResourceType, Status } from "../../constants";
import { Group, userHasGroup, useUser } from "../../hooks/useUser";
import { intl } from "../../util/intl/intl";
import ClusterSummarySection from "./ClusterSummarySection";

dayjs.locale("nb");

const ClusterPage = () => {
  const { clusterId } = useParams<{ clusterId: string }>();
  const user = useUser();

  const clustersQuery = useQuery({
    queryKey: ["getCluster", clusterId],
    queryFn: () => getCluster(clusterId as string),
    enabled: !!clusterId,
  });

  const allTeamsForClusterQuery = useQuery({
    queryKey: ["getAllTeamsForCluster", clusterId],
    queryFn: () => getAllTeamsForCluster(clusterId as string),
    enabled: !!clusterId,
    select: (data) => data.content.filter((team) => team.status === Status.ACTIVE),
  });

  const cluster = clustersQuery.data;
  const clusterMembers = cluster?.members ?? [];
  const teams = allTeamsForClusterQuery.data ?? [];

  const numberOfExternalMembers = (cluster?.members ?? []).filter(
    (member) => member.resource.resourceType === ResourceType.EXTERNAL
  ).length;

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
          <PageTitle title={cluster.name} />

          <div
            className={css`
              display: flex;
              justify-content: space-between;
              align-items: center;
            `}
          >
            <StatusField status={cluster.status} />

            <div
              className={css`
                margin-top: 2rem;
                display: flex;
                align-items: center;
              `}
            >
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
              <Button disabled icon={<SvgBellFilled aria-hidden />} size="medium" variant="secondary">
                Bli varslet
              </Button>
            </div>
          </div>

          <div
            className={css`
              display: flex;
              gap: 1rem;
              margin-top: 2rem;

              & > div {
                flex: 1;
              }
            `}
          >
            <ResourceInfoLayout expandFirstSection={false}>
              <DescriptionSection header="Om oss" text={<Markdown source={cluster.description} />} />
              <ClusterSummarySection cluster={cluster} />
            </ResourceInfoLayout>
          </div>
        </>
      )}
      <LargeDivider />
      <TeamsSection teams={teams} />
      <LargeDivider />
      <div
        className={css`
          display: flex;
          justify-content: left;
          align-items: center;
          margin-bottom: 2rem;
        `}
      >
        <Heading
          className={css`
            margin-right: 2rem;
            margin-top: 0;
          `}
          size="medium"
        >
          Medlemmer på klyngenivå ({cluster?.members.length})
        </Heading>
        {numberOfExternalMembers > 0 && clusterMembers.length > 0 && (
          <b>
            Eksterne {numberOfExternalMembers} ({((numberOfExternalMembers / clusterMembers.length) * 100).toFixed(0)}
            %)
          </b>
        )}
      </div>
      {clusterMembers.length > 0 ? <Members members={clusterMembers} /> : <></>}
      <LastModifiedBy changeStamp={cluster?.changeStamp} />
    </div>
  );
};

export default ClusterPage;
