import { css } from "@emotion/css";
import { PencilFillIcon } from "@navikt/aksel-icons";
import { Button, Heading } from "@navikt/ds-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { Link as ReactRouterLink, useParams } from "react-router-dom";

import { getAllClusters } from "../../api/clusterApi";
import { NotificationType } from "../../api/notificationApi";
import {
  getProductArea,
  mapProductAreaToFormValues,
  mapProductAreaToSubmitValues,
  putProductArea,
} from "../../api/productAreaApi";
import { AllCharts } from "../../components/charts/AllCharts";
import { CardContainer, ClusterCard } from "../../components/common/Card";
import { DescriptionSection } from "../../components/common/DescriptionSection";
import { MemberExportForArea } from "../../components/common/MemberExport";
import { Members } from "../../components/common/Members";
import { NumberOfPeopleInResource } from "../../components/common/NumberOfPeopleInResource";
import { ResourceInfoLayout } from "../../components/common/ResourceInfoContainer";
import { LargeDivider } from "../../components/Divider";
import { LastModifiedBy } from "../../components/LastModifiedBy";
import { MemberHeaderWithActions } from "../../components/MemberHeaderWithActions";
import { PageHeader } from "../../components/PageHeader";
import { SubscribeToUpdates } from "../../components/SubscribeToUpdates";
import { EditMembersModal } from "../../components/team/EditMembersModal";
import { TeamsSection } from "../../components/team/TeamsSection";
import type { MemberFormValues, ProductArea, ProductAreaSubmitValues } from "../../constants";
import { AreaType, Status } from "../../constants";
import { Group, useAllTeams, useDashboard, userHasGroup, useUser } from "../../hooks";
import { intl } from "../../util/intl/intl";
import { ModalArea } from "./ModalArea";
import { OwnerAreaSummary } from "./OwnerAreaSummary";
import { ShortAreaSummarySection } from "./ShortAreaSummarySection";

export const ProductAreaPage = () => {
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [showMembersModal, setShowMembersModal] = React.useState<boolean>(false);
  const { productAreaId } = useParams<{ productAreaId: string }>();
  const queryClient = useQueryClient();
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

  const allTeamsForProductAreaQuery = useAllTeams({ productAreaId: productAreaId, status: Status.ACTIVE });

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

  const handleSubmit = async (productAreaSubmitValues: ProductAreaSubmitValues) => {
    if (!productArea) {
      throw new Error("productArea must be defined");
    }

    const response = await putProductArea(productArea.id, productAreaSubmitValues);
    if (response.id) {
      setShowModal(false);
      await productAreasQuery.refetch();
    }
  };

  const updateMemberOfTeamMutation = useMutation<ProductArea, unknown, MemberFormValues[]>(
    async (updatedMemberList) => {
      if (!productArea) {
        throw new Error("productArea must be defined");
      }

      // TODO: ProductArea PUT request/response and form input vs form submit values are a proper mess and should be fixed some day
      return await putProductArea(productArea.id, {
        ...mapProductAreaToSubmitValues(mapProductAreaToFormValues(productArea)),
        members: updatedMemberList,
        areaType: productArea.areaType || AreaType.OTHER,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["getProductArea", productAreaId] });
      },
    },
  );

  return (
    <>
      {productArea && (
        <>
          <PageHeader status={productArea.status} title={productArea.name}>
            {userHasGroup(user, Group.ADMIN) && (
              <ReactRouterLink
                className={css`
                  align-self: center;
                `}
                to={`/admin/audit/${productArea.id}/diff`}
              >
                Se alle versjoner
              </ReactRouterLink>
            )}
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
            <DescriptionSection markdownText={productArea.description} />
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
          <EditMembersModal
            members={productAreaMembers}
            onClose={() => setShowMembersModal(false)}
            open={showMembersModal}
            updateMemberOfTeamMutation={updateMemberOfTeamMutation}
          />
        </>
      )}
      <LargeDivider />
      <AllCharts areas={[productArea].filter(Boolean) as ProductArea[]} clusters={clusters} teams={teams} />
    </>
  );
};
