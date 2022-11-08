import type { ProductArea } from "../../constants";
import { intl } from "../../util/intl/intl";
import { ResourceInfoContainer } from "../common/ResourceInfoContainer";
import { DisplayTags } from "../common/Tags";
import { SlackLink } from "../SlackLink";
import { TextWithLabel } from "../TextWithLabel";

interface ShortAreaSummaryProperties {
  productArea: ProductArea;
}

const ShortAreaSummarySection = (properties: ShortAreaSummaryProperties) => {
  const { productArea } = properties;
  return (
    <ResourceInfoContainer title="Kort fortalt">
      <TextWithLabel
        label="Områdetype"
        text={
          productArea.areaType ? intl.getString(productArea.areaType + "_AREATYPE_DESCRIPTION") : intl.dataIsMissing
        }
      />
      <TextWithLabel label="Tagg" text={<DisplayTags tags={productArea.tags} />} />
      <TextWithLabel
        label="Slack"
        text={productArea.slackChannel ? <SlackLink channel={productArea.slackChannel} /> : "Fant ikke slack kanal"}
      />
    </ResourceInfoContainer>
  );
};

export default ShortAreaSummarySection;
