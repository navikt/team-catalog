import "dayjs/plugin/localizedFormat";

import { css } from "@emotion/css";
import { EditFilled } from "@navikt/ds-icons";
import SvgBellFilled from "@navikt/ds-icons/esm/BellFilled";
import { Button, Heading } from "@navikt/ds-react";
import dayjs from "dayjs";
import { Fragment } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { getAllTeams, getProductArea } from "../../api";
import { getAllClusters } from "../../api/clusterApi";
import { CardContainer, ClusterCard } from "../../components/common/Card";
import DescriptionSection from "../../components/common/DescriptionSection";
import Members from "../../components/common/Members";
import { NumberOfPeopleInResource } from "../../components/common/NumberOfPeopleInResource";
import { ResourceInfoLayout } from "../../components/common/ResourceInfoContainer";
import { LargeDivider } from "../../components/Divider";
import { ErrorMessageWithLink } from "../../components/ErrorMessageWithLink";
import { LastModifiedBy } from "../../components/LastModifiedBy";
import { Markdown } from "../../components/Markdown";
import { PageHeader } from "../../components/PageHeader";
import { TeamsSection } from "../../components/team/TeamsSection";
import { AreaType, ResourceType, Status } from "../../constants";
import { useDashboard } from "../../hooks/useDashboard";
import { Group, userHasGroup, useUser } from "../../hooks/useUser";
import { intl } from "../../util/intl/intl";
import OwnerAreaSummary from "./OwnerAreaSummary";
import ShortAreaSummarySection from "./ShortAreaSummarySection";

dayjs.locale("nb");

const ProductAreaPage = () => {
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
              <Button disabled icon={<EditFilled aria-hidden />} size="medium" variant="secondary">
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
            `}
            level={"3"}
            size="small"
          >
            Eksterne {numberOfExternalMembers} (
            {((numberOfExternalMembers / productAreaMembers.length) * 100).toFixed(0)}
            %)
          </Heading>
        )}
      </div>
      {productAreaMembers.length > 0 ? <Members members={productAreaMembers} /> : <p>Ingen medlemmer på områdenivå.</p>}
      <LastModifiedBy changeStamp={productArea?.changeStamp} />
    </div>
  );
};

export default ProductAreaPage;
