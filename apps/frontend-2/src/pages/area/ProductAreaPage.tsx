import "dayjs/plugin/localizedFormat";

import { css } from "@emotion/css";
import { EditFilled } from "@navikt/ds-icons";
import SvgBellFilled from "@navikt/ds-icons/esm/BellFilled";
import { BodyShort, Button, Heading } from "@navikt/ds-react";
import dayjs from "dayjs";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { getAllTeamsForProductArea, getProductArea } from "../../api";
import { getAllClusters } from "../../api/clusterApi";
import { AuditName } from "../../components/AuditName";
import { CardContainer, ClusterCard } from "../../components/common/Card";
import DescriptionSection from "../../components/common/DescriptionSection";
import Members from "../../components/common/Members";
import { ResourceInfoLayout } from "../../components/common/ResourceInfoContainer";
import { LargeDivider } from "../../components/Divider";
import { ErrorMessageWithLink } from "../../components/ErrorMessageWithLink";
import { Markdown } from "../../components/Markdown";
import PageTitle from "../../components/PageTitle";
import StatusField from "../../components/StatusField";
import { TeamsSection } from "../../components/team/TeamsSection";
import { AreaType, ResourceType, Status } from "../../constants";
import { user } from "../../services/User";
import { intl } from "../../util/intl/intl";
import OwnerAreaSummary from "./OwnerAreaSummary";
import ShortAreaSummarySection from "./ShortAreaSummarySection";

dayjs.locale("nb");

const ProductAreaPage = () => {
  const { areaId } = useParams<{ areaId: string }>();

  const productAreasQuery = useQuery({
    queryKey: ["getProductArea", areaId],
    queryFn: () => getProductArea(areaId as string),
    enabled: !!areaId,
  });

  // Cache for 24 hours.
  const clustersForProductAreaQuery = useQuery({
    queryKey: ["getAllClusters", areaId],
    queryFn: () => getAllClusters("active"),
    select: (clusters) => clusters.content.filter((cluster) => cluster.productAreaId === areaId),
    cacheTime: 1000 * 60 * 60 * 24,
  });

  const allTeamsForProductAreaQuery = useQuery({
    queryKey: ["getAllTeamsForProductArea", areaId],
    queryFn: () => getAllTeamsForProductArea(areaId as string),
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
          <PageTitle title={productArea.name} />

          <div
            className={css`
              display: flex;
              justify-content: space-between;
              align-items: center;
            `}
          >
            <StatusField status={productArea.status} />

            {productArea.changeStamp && (
              <div
                className={css`
                  margin-top: 2rem;
                  display: flex;
                  align-items: center;
                `}
              >
                <BodyShort
                  className={css`
                    margin-right: 2rem;
                  `}
                  size="small"
                >
                  <b>Sist endret av :</b> <AuditName name={productArea.changeStamp.lastModifiedBy} /> -{" "}
                  {dayjs(productArea.changeStamp?.lastModifiedDate).format("D. MMMM, YYYY H:mm ")}
                </BodyShort>

                {user.canWrite() && (
                  <Button
                    className={css`
                      margin-right: 1rem;
                    `}
                    icon={<EditFilled aria-hidden />}
                    size="medium"
                    variant="secondary"
                  >
                    {intl.edit}
                  </Button>
                )}
                <Button icon={<SvgBellFilled aria-hidden />} size="medium" variant="secondary">
                  Bli varslet
                </Button>
              </div>
            )}
          </div>
          <ResourceInfoLayout expandFirstSection={productArea.areaType == AreaType.PRODUCT_AREA}>
            <DescriptionSection header="Beskrivelse" text={<Markdown source={productArea.description} />} />
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
          size="medium"
        >
          Klynger ({clusters.length})
        </Heading>
      </div>
      <CardContainer>
        {clusters.map((cluster) => (
          <ClusterCard cluster={cluster} key={cluster.id} />
        ))}
      </CardContainer>
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
          Medlemmer på områdenivå ({productAreaMembers.length})
        </Heading>
        {numberOfExternalMembers > 0 && productAreaMembers.length > 0 && (
          <b>
            Eksterne {numberOfExternalMembers} (
            {((numberOfExternalMembers / productAreaMembers.length) * 100).toFixed(0)}
            %)
          </b>
        )}
      </div>
      {productAreaMembers.length > 0 ? <Members members={productAreaMembers} /> : <></>}
    </div>
  );
};

export default ProductAreaPage;
