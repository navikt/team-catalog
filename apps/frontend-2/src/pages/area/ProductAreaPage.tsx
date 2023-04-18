import "dayjs/plugin/localizedFormat";

import { css } from "@emotion/css";
import { EditFilled } from "@navikt/ds-icons";
import SvgBellFilled from "@navikt/ds-icons/esm/BellFilled";
import { Button, Heading } from "@navikt/ds-react";
import { Fragment } from "react";
import React from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { editProductArea, getAllTeams, getProductArea, mapProductAreaToFormValues } from "../../api";
import { getAllClusters } from "../../api";
import ModalArea from "../../components/area/ModalArea";
import { CardContainer, ClusterCard } from "../../components/common/Card";
import DescriptionSection from "../../components/common/DescriptionSection";
import { MemberExportForArea } from "../../components/common/MemberExport";
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
import type { MemberFormValues, ProductAreaSubmitValues } from "../../constants";
import { AreaType, ResourceType, Status } from "../../constants";
import { useDashboard } from "../../hooks";
import { Group, userHasGroup, useUser } from "../../hooks";
import { intl } from "../../util/intl/intl";
import OwnerAreaSummary from "./OwnerAreaSummary";
import ShortAreaSummarySection from "./ShortAreaSummarySection";

const ProductAreaPage = () => {
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [showMembersModal, setShowMembersModal] = React.useState<boolean>(false);
  const { areaId } = useParams<{ areaId: string }>();
  const user = useUser();
  const dash = useDashboard();

  const productAreasQuery = useQuery({
    queryKey: ["getProductArea", areaId],
    queryFn: () => getProductArea(areaId as string),
    enabled: !!areaId,
  });

  const clustersForProductAreaQuery = useQuery({
    queryKey: ["getAllClusters", areaId],
    queryFn: () => getAllClusters({ status: Status.ACTIVE }),
    select: (clusters) => clusters.content.filter((cluster) => cluster.productAreaId === areaId),
  });

  const allTeamsForProductAreaQuery = useQuery({
    queryKey: ["getAllTeams", areaId],
    queryFn: () => getAllTeams({ productAreaId: areaId }),
    enabled: !!areaId,
    select: (data) => data.content.filter((team) => team.status === Status.ACTIVE),
  });

  const productArea = productAreasQuery.data;
  const productAreaMembers = productArea?.members ?? [];
  const teams = allTeamsForProductAreaQuery.data ?? [];
  const clusters = clustersForProductAreaQuery.data ?? [];

  const numberOfExternalMembers = (productArea?.members ?? []).filter(
    (member) => member.resource.resourceType === ResourceType.EXTERNAL
  ).length;

  const productAreaSummary = dash?.areaSummaryMap[productArea?.id ?? ""];

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
    <div>
      {productAreasQuery.isError && (
        <ErrorMessageWithLink
          errorMessage={intl.productAreaNotFound}
          href="/team"
          linkText={intl.linkToAllProductAreasText}
        />
      )}

      {productArea && (
        <>
          <PageHeader status={productArea.status} title={productArea.name}>
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
            numberOfExternals={productAreaSummary?.uniqueResourcesExternal ?? 0}
            numberOfPeople={productAreaSummary?.uniqueResourcesCount ?? 0}
            resourceNoun="området"
            url={`/memberships?productAreaId=${areaId}`}
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
      <div
        className={css`
          display: flex;
          justify-content: space-between;
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
          Klynger ({clusters.length})
        </Heading>
      </div>
      {clusters.length === 0 ? (
        <p>Ingen klynger i området. Området knyttes til klyngene via klyngesiden.</p>
      ) : (
        <Fragment>
          <CardContainer>
            {clusters.map((cluster) => (
              <ClusterCard cluster={cluster} key={cluster.id} />
            ))}
          </CardContainer>
        </Fragment>
      )}

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
          Medlemmer på områdenivå ({productAreaMembers.length})
        </Heading>
        {numberOfExternalMembers > 0 && productAreaMembers.length > 0 && (
          <Heading
            className={css`
              margin-top: 0;
              align-self: center;
              flex: 1;
            `}
            level={"3"}
            size="small"
          >
            Eksterne {numberOfExternalMembers} (
            {((numberOfExternalMembers / productAreaMembers.length) * 100).toFixed(0)}
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

          {areaId && <MemberExportForArea areaId={areaId} />}
        </div>
      </div>
      {productAreaMembers.length > 0 ? <Members members={productAreaMembers} /> : <p>Ingen medlemmer på områdenivå.</p>}
      <LastModifiedBy changeStamp={productArea?.changeStamp} />

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
    </div>
  );
};

export default ProductAreaPage;
