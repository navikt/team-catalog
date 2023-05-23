import "dayjs/plugin/localizedFormat";

import { PencilFillIcon } from "@navikt/aksel-icons";
import { Button } from "@navikt/ds-react";
import React, { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";

import { editCluster, getCluster, mapClusterToFormValues } from "../../api/clusterApi";
import { getAllTeams } from "../../api/teamApi";
import { AllCharts } from "../../components/charts/AllCharts";
import { DescriptionSection } from "../../components/common/DescriptionSection";
import { MemberExportForCluster } from "../../components/common/MemberExport";
import { Members } from "../../components/common/Members";
import { NumberOfPeopleInResource } from "../../components/common/NumberOfPeopleInResource";
import { ResourceInfoLayout } from "../../components/common/ResourceInfoContainer";
import { LargeDivider } from "../../components/Divider";
import { LastModifiedBy } from "../../components/LastModifiedBy";
import { Markdown } from "../../components/Markdown";
import { MemberHeaderWithActions } from "../../components/MemberHeaderWithActions";
import { PageHeader } from "../../components/PageHeader";
import { EditMembersModal2 } from "../../components/team/EditMembersModal2";
import { TeamsSection } from "../../components/team/TeamsSection";
import type { Cluster, ClusterSubmitValues, MemberFormValues } from "../../constants";
import { Status } from "../../constants";
import { useDashboard } from "../../hooks";
import { Group, userHasGroup, useUser } from "../../hooks";
import { intl } from "../../util/intl/intl";
import { ClusterSummarySection } from "./ClusterSummarySection";
import { ModalCluster } from "./ModalCluster";

export const ClusterPage = () => {
  const { clusterId } = useParams<{ clusterId: string }>();
  const user = useUser();
  const dash = useDashboard();
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [showMembersModal, setShowMembersModal] = React.useState<boolean>(false);
  const queryClient = useQueryClient();

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

  const clusterSummary = dash?.clusterSummaryMap[cluster?.id ?? ""];

  useEffect(() => {
    if (cluster) {
      document.title = `Teamkatalogen - ${cluster.name}`;
    }
  }, [cluster]);

  const handleSubmit = async (values: ClusterSubmitValues) => {
    const response = await editCluster({ ...values, id: cluster?.id });
    if (response.id) {
      setShowModal(false);
      await clustersQuery.refetch();
    }
  };

  const updateMemberOfTeamMutation = useMutation<Cluster, unknown, MemberFormValues>(
    async (newOrUpdatedMember) => {
      if (!cluster) {
        throw new Error("productArea must be defined");
      }
      const unchangedMembers = (cluster?.members ?? []).filter(
        (member) => newOrUpdatedMember.navIdent !== member.navIdent
      );

      return await editCluster({
        ...cluster,
        members: [...unchangedMembers, newOrUpdatedMember],
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["getCluster", clusterId] });
      },
    }
  );

  return (
    <div>
      {cluster && (
        <>
          <PageHeader status={cluster.status} title={cluster.name}>
            {userHasGroup(user, Group.WRITE) && (
              <Button
                icon={<PencilFillIcon aria-hidden />}
                onClick={() => setShowModal(true)}
                size="medium"
                variant="secondary"
              >
                {intl.edit}
              </Button>
            )}
          </PageHeader>

          <NumberOfPeopleInResource
            numberOfExternals={clusterSummary?.uniqueResourcesExternal ?? 0}
            numberOfPeople={clusterSummary?.totalUniqueResourcesCount ?? 0}
            resourceNoun="klyngen"
            url={`/memberships?clusterId=${clusterId}`}
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
      <MemberHeaderWithActions members={clusterMembers} title="Medlemmer på klyngenivå">
        <Button
          icon={<PencilFillIcon aria-hidden />}
          onClick={() => setShowMembersModal(true)}
          size="medium"
          variant="secondary"
        >
          Endre medlemmer
        </Button>
        {clusterId && clusterMembers.length > 0 && <MemberExportForCluster clusterId={clusterId} />}
      </MemberHeaderWithActions>
      {clusterMembers.length > 0 ? <Members members={clusterMembers} /> : <></>}
      <LastModifiedBy changeStamp={cluster?.changeStamp} />

      {userHasGroup(user, Group.WRITE) && (
        <>
          <ModalCluster
            initialValues={mapClusterToFormValues(cluster)}
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSubmitForm={(values: ClusterSubmitValues) => handleSubmit(values)}
            title="Rediger klynge"
          />
          <EditMembersModal2
            members={clusterMembers}
            onClose={() => setShowMembersModal(false)}
            open={showMembersModal}
            updateMemberOfTeamMutation={updateMemberOfTeamMutation}
          />
        </>
      )}
      <LargeDivider />
      <AllCharts areas={[]} clusters={[cluster].filter(Boolean) as Cluster[]} teams={teams} />
    </div>
  );
};
