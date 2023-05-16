import "dayjs/plugin/localizedFormat";

import { PencilFillIcon } from "@navikt/aksel-icons";
import { Button, Heading } from "@navikt/ds-react";
import React, { useEffect } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { getAllClusters } from "../../api/clusterApi";
import { NotificationType } from "../../api/notificationApi";
import { editProductArea, getProductArea, mapProductAreaToFormValues } from "../../api/productAreaApi";
import { getAllTeams } from "../../api/teamApi";
import { AllCharts } from "../../components/charts/AllCharts";
import { CardContainer, ClusterCard } from "../../components/common/Card";
import { DescriptionSection } from "../../components/common/DescriptionSection";
import { MemberExportForArea } from "../../components/common/MemberExport";
import { Members } from "../../components/common/Members";
import { NumberOfPeopleInResource } from "../../components/common/NumberOfPeopleInResource";
import { ResourceInfoLayout } from "../../components/common/ResourceInfoContainer";
import { LargeDivider } from "../../components/Divider";
import { LastModifiedBy } from "../../components/LastModifiedBy";
import { Markdown } from "../../components/Markdown";
import { MemberHeaderWithActions } from "../../components/MemberHeaderWithActions";
import { PageHeader } from "../../components/PageHeader";
import { SubscribeToUpdates } from "../../components/SubscribeToUpdates";
import { ModalMembers } from "../../components/team/ModalMembers";
import { TeamsSection } from "../../components/team/TeamsSection";
import type { MemberFormValues, ProductArea, ProductAreaSubmitValues } from "../../constants";
import { AreaType, Status } from "../../constants";
import { Group, useDashboard, userHasGroup, useUser } from "../../hooks";
import { intl } from "../../util/intl/intl";
import { ModalArea } from "./ModalArea";
import { OwnerAreaSummary } from "./OwnerAreaSummary";
import { ShortAreaSummarySection } from "./ShortAreaSummarySection";

export const ProductAreaPage = () => {
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [showMembersModal, setShowMembersModal] = React.useState<boolean>(false);
  const { productAreaId } = useParams<{ productAreaId: string }>();
  const user = useUser();
  const dash = useDashboard();

  const productAreasQuery = useQuery({
    queryKey: ["getProductArea", productAreaId],
    queryFn: () => getProductArea(productAreaId as string),
    enabled: !!productAreaId,
  });

  const clustersForProductAreaQuery = useQuery({
    queryKey: ["getAllClusters", productAreaId],
    queryFn: () => getAllClusters({ status: Status.ACTIVE }),
    select: (clusters) => clusters.content.filter((cluster) => cluster.productAreaId === productAreaId),
  });

  const allTeamsForProductAreaQuery = useQuery({
    queryKey: ["getAllTeams", productAreaId],
    queryFn: () => getAllTeams({ productAreaId: productAreaId }),
    enabled: !!productAreaId,
    select: (data) => data.content.filter((team) => team.status === Status.ACTIVE),
  });

  const productArea = productAreasQuery.data;
  const productAreaMembers = productArea?.members ?? [];
  const teams = allTeamsForProductAreaQuery.data ?? [];
  const clusters = clustersForProductAreaQuery.data ?? [];

  const productAreaSummary = dash?.areaSummaryMap[productArea?.id ?? ""];

  useEffect(() => {
    if (productArea) {
      document.title = `Teamkatalogen - ${productArea.name}`;
    }
  }, [productArea]);

  const handleSubmit = async (values: ProductAreaSubmitValues) => {
    const response = await editProductArea({ ...values, id: productArea?.id });
    if (response.id) {
      setShowModal(false);
      await productAreasQuery.refetch();
    } else {
      console.log(response);
    }
  };

  const handleMemberSubmit = async (values: MemberFormValues[]) => {
    if (productArea) {
      const editResponse = await editProductArea({
        ...productArea,
        members: values,
        areaType: productArea.areaType || AreaType.OTHER,
      });
      await productAreasQuery.refetch();

      if (editResponse.id) {
        setShowMembersModal(false);
      } else {
        console.log(editResponse);
      }
    }
  };

  return (
    <>
      {productArea && (
        <>
          <PageHeader status={productArea.status} title={productArea.name}>
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
            <SubscribeToUpdates notificationType={NotificationType.PA} target={productAreaId} />
          </PageHeader>
          <NumberOfPeopleInResource
            numberOfExternals={productAreaSummary?.uniqueResourcesExternal ?? 0}
            numberOfPeople={productAreaSummary?.uniqueResourcesCount ?? 0}
            resourceNoun="området"
            url={`/memberships?productAreaId=${productAreaId}`}
          />
          <ResourceInfoLayout expandFirstSection={productArea.areaType == AreaType.PRODUCT_AREA}>
            <DescriptionSection header="Om oss" text={<Markdown source={productArea.description} />} />
            <ShortAreaSummarySection productArea={productArea} />
            {productArea.areaType == AreaType.PRODUCT_AREA && <OwnerAreaSummary productArea={productArea} />}
          </ResourceInfoLayout>
        </>
      )}
      <LargeDivider />
      <TeamsSection teams={teams} />
      <LargeDivider />
      <Heading level={"2"} size="medium">
        Klynger ({clusters.length})
      </Heading>
      {clusters.length === 0 ? (
        <p>Ingen klynger i området. Området knyttes til klyngene via klyngesiden.</p>
      ) : (
        <CardContainer>
          {clusters.map((cluster) => (
            <ClusterCard cluster={cluster} key={cluster.id} />
          ))}
        </CardContainer>
      )}
      <LargeDivider />
      <MemberHeaderWithActions members={productAreaMembers} title="Medlemmer på områdenivå">
        <Button
          icon={<PencilFillIcon aria-hidden />}
          onClick={() => setShowMembersModal(true)}
          size="medium"
          variant="secondary"
        >
          Endre medlemmer
        </Button>
        {productAreaId && <MemberExportForArea areaId={productAreaId} />}
      </MemberHeaderWithActions>
      {productAreaMembers.length > 0 ? <Members members={productAreaMembers} /> : <p>Ingen medlemmer på områdenivå.</p>}
      <LastModifiedBy changeStamp={productArea?.changeStamp} />

      {/*TODO 16 May 2023 (Johannes Moskvil): these should be localized with its button*/}
      {userHasGroup(user, Group.WRITE) && (
        <>
          <ModalArea
            initialValues={mapProductAreaToFormValues(productArea)}
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSubmitForm={(values: ProductAreaSubmitValues) => handleSubmit(values)}
            title="Rediger område"
          />

          <ModalMembers
            initialValues={mapProductAreaToFormValues(productArea).members || []}
            isOpen={showMembersModal}
            onClose={() => setShowMembersModal(false)}
            onSubmitForm={(values: MemberFormValues[]) => handleMemberSubmit(values)}
            title={"Endre medlemmer"}
          />
        </>
      )}
      <LargeDivider />
      <AllCharts areas={[productArea].filter(Boolean) as ProductArea[]} clusters={clusters} teams={teams} />
    </>
  );
};
