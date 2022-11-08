import { css } from "@emotion/css";
import { BodyShort } from "@navikt/ds-react";
import React from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

import { getProductArea } from "../../api";
import type { Cluster, ProductArea } from "../../constants";
import { ResourceInfoContainer } from "../common/ResourceInfoContainer";
import { SlackLink } from "../SlackLink";
import { TextWithLabel } from "../TextWithLabel";

interface ShortAreaSummaryProperties {
  cluster: Cluster;
}

const DisplayTags = (properties: { tags: string[] }) => {
  if (properties.tags.length <= 0) return <BodyShort>Ingen tags</BodyShort>;
  return (
    <div
      className={css`
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      `}
    >
      {properties.tags.map((t: string, index: number) => (
        <Link key={t} to={"/tag/" + t}>
          {t} {index + 1 < properties.tags.length ? ", " : ""}
        </Link>
      ))}
    </div>
  );
};

const ShortClusterSummarySection = (properties: ShortAreaSummaryProperties) => {
  const { cluster } = properties;
  const [productArea, setProductArea] = React.useState<ProductArea>();

  useEffect(() => {
    (async () => {
      if (cluster?.productAreaId) {
        const productAreaResponse = await getProductArea(cluster.productAreaId);
        setProductArea(productAreaResponse);
      } else {
        setProductArea(undefined);
      }
    })();
  }, [cluster?.productAreaId]);
  return (
    <ResourceInfoContainer title="Kort fortalt">
      <TextWithLabel label={"Område"} text={<Link to={"/area/" + productArea?.id}>{productArea?.name}</Link>} />
      <TextWithLabel label="Tagg" text={<DisplayTags tags={cluster.tags} />} />
      <TextWithLabel
        label="Slack"
        text={!cluster.slackChannel ? "Fant ikke slack kanal" : <SlackLink channel={cluster.slackChannel} />}
      />
    </ResourceInfoContainer>
  );
};

export default ShortClusterSummarySection;
