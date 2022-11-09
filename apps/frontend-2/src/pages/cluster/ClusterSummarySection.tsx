import React from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

import { getProductArea } from "../../api";
import { ResourceInfoContainer } from "../../components/common/ResourceInfoContainer";
import { DisplayTags } from "../../components/common/Tags";
import { SlackLink } from "../../components/SlackLink";
import { TextWithLabel } from "../../components/TextWithLabel";
import type { Cluster, ProductArea } from "../../constants";

const ClusterSummarySection = ({ cluster }: { cluster: Cluster }) => {
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

export default ClusterSummarySection;
