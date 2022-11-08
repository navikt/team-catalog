import React from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

import { getProductArea } from "../../api";
import type { Cluster, ProductArea } from "../../constants";
import { ResourceInfoContainer } from "../common/ResourceInfoContainer";
import { DisplayTags } from "../common/Tags";
import { SlackLink } from "../SlackLink";
import { TextWithLabel } from "../TextWithLabel";

interface ShortAreaSummaryProperties {
  cluster: Cluster;
}

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
