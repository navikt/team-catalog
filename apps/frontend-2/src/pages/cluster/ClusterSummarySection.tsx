import { useQuery } from "react-query";
import { Link } from "react-router-dom";

import { getProductArea } from "../../api/productAreaApi";
import { ResourceInfoContainer } from "../../components/common/ResourceInfoContainer";
import { Tags } from "../../components/common/Tags";
import { SlackLink } from "../../components/SlackLink";
import { TextWithLabel } from "../../components/TextWithLabel";
import type { Cluster } from "../../constants";

export const ClusterSummarySection = ({ cluster }: { cluster: Cluster }) => {
  const productAreaQuery = useQuery({
    queryKey: ["getProductArea", cluster.productAreaId],
    queryFn: () => getProductArea(cluster.productAreaId as string),
    enabled: !!cluster.productAreaId,
  });

  return (
    <ResourceInfoContainer title="Kort fortalt">
      <TextWithLabel
        label="Område"
        text={<Link to={"/area/" + productAreaQuery.data?.id}>{productAreaQuery.data?.name}</Link>}
      />
      <TextWithLabel label="Tagg" text={<Tags tags={cluster.tags} />} />
      <TextWithLabel
        label="Slack"
        text={cluster.slackChannel ? <SlackLink channel={cluster.slackChannel} /> : "Fant ikke slack kanal"}
      />
    </ResourceInfoContainer>
  );
};
