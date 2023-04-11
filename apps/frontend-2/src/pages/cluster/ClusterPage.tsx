import "dayjs/plugin/localizedFormat";

import { css } from "@emotion/css";
import { EditFilled } from "@navikt/ds-icons";
import SvgBellFilled from "@navikt/ds-icons/esm/BellFilled";
import { Button, Heading } from "@navikt/ds-react";
import dayjs from "dayjs";
import React from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { editCluster, getAllTeams, mapClusterToFormValues } from "../../api";
import { getCluster } from "../../api";
import ModalCluster from "../../components/cluster/ModalCluster";
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
import ModalMembers from "../../components/team/ModalMembers";
import { TeamsSection } from "../../components/team/TeamsSection";
import type { ClusterSubmitValues, MemberFormValues } from "../../constants";
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
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [showMembersModal, setShowMembersModal] = React.useState<boolean>(false);

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

  const handleSubmit = async (values: ClusterSubmitValues) => {
    const response = await editCluster({ ...values, id: cluster?.id });
    if (response.id) {
      setShowModal(false);
      await clustersQuery.refetch();
    } else {
      console.log(response);
    }
  };

  const handleMemberSubmit = async (values: MemberFormValues[]) => {
    if (cluster) {
      const editResponse = await editCluster({
        ...cluster,
        members: values,
      });
      await clustersQuery.refetch();

      if (editResponse.id) {
        setShowMembersModal(false);
      } else {
        console.log(editResponse);
      }
    }
  };

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
              <Button
                icon={<EditFilled aria-hidden />}
                onClick={() => setShowModal(true)}
                size="medium"
                variant="secondary"
              >
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

        <div
          className={css`
            display: flex;
            gap: 1rem;
          `}
        >
          <Button
            icon={<EditFilled aria-hidden />}
            onClick={() => setShowMembersModal(true)}
            size="medium"
            variant="secondary"
          >
            Endre medlemmer
          </Button>

          <MemberExport />
        </div>
      </div>

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

          <ModalMembers
            initialValues={mapClusterToFormValues(cluster).members || []}
            isOpen={showMembersModal}
            onClose={() => setShowMembersModal(false)}
            onSubmitForm={(values: MemberFormValues[]) => handleMemberSubmit(values)}
            title={"Endre medlemmer"}
          />
        </>
      )}
    </div>
  );
};

export default ClusterPage;
