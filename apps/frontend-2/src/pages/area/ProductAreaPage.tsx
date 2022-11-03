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
import OwnerAreaSummary from "../../components/area/OwnerAreaSummary";
import ShortAreaSummarySection from "../../components/area/ShortAreaSummarySection";
import { AuditName } from "../../components/AuditName";
import Clusters from "../../components/common/cluster/Clusters";
import DescriptionSection from "../../components/common/DescriptionSection";
import Members from "../../components/common/Members";
import Teams from "../../components/common/team/Teams";
import Divider from "../../components/Divider";
import { ErrorMessageWithLink } from "../../components/ErrorMessageWithLink";
import { Markdown } from "../../components/Markdown";
import PageTitle from "../../components/PageTitle";
import StatusField from "../../components/StatusField";
import { AreaType, ResourceType, Status } from "../../constants";
import { user } from "../../services/User";
import { intl } from "../../util/intl/intl";
import type { PathParameters as PathParameters } from "../team/TeamPage";

dayjs.locale("nb");

const ProductAreaPage = () => {
  const parameters = useParams<PathParameters>();

  const productAreasQuery = useQuery({
    queryKey: ["getProductArea", parameters.id],
    queryFn: () => getProductArea(parameters.id as string),
    enabled: !!parameters.id,
  });

  // Cache for 24 hours.
  const clustersForProductAreaQuery = useQuery({
    queryKey: ["getAllClusters", parameters.id],
    queryFn: () => getAllClusters("active"),
    select: (clusters) => clusters.content.filter((cluster) => cluster.productAreaId === parameters.id),
    cacheTime: 1000 * 60 * 60 * 24,
  });

  const allTeamsForProductAreaQuery = useQuery({
    queryKey: ["getAllTeamsForProductArea", parameters.id],
    queryFn: () => getAllTeamsForProductArea(parameters.id as string),
    enabled: !!parameters.id,
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
            <div>
              <StatusField status={productArea.status} />
            </div>

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

          <div
            className={css`
              display: grid;
              grid-template-columns: 0.4fr 0.4fr 0.4fr;
              grid-column-gap: 1rem;
              margin-top: 2rem;
            `}
          >
            <DescriptionSection header="Beskrivelse" text={<Markdown source={productArea.description} />} />
            <ShortAreaSummarySection productArea={productArea} />
            {productArea.areaType == AreaType.PRODUCT_AREA && <OwnerAreaSummary productArea={productArea} />}
          </div>
        </>
      )}
      <Divider />
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
            margin-top: 0px;
          `}
          size="medium"
        >
          Team ({teams.length})
        </Heading>
        <Button
          className={css`
            margin-right: 1rem;
          `}
          size="medium"
          variant="secondary"
        >
          Eksporter team
        </Button>
      </div>
      <Teams teams={teams} />

      <Divider />
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
      <Clusters clusters={clusters} />
      <Divider />
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
