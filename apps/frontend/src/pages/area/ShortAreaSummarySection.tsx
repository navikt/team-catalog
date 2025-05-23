import { ResourceInfoContainer } from "../../components/common/ResourceInfoContainer";
import { Tags } from "../../components/common/Tags";
import { NomOrgLink } from "../../components/NomOrgLink";
import { SlackLink } from "../../components/SlackLink";
import { TextWithLabel } from "../../components/TextWithLabel";
import type { ProductArea } from "../../constants";
import { intl } from "../../util/intl/intl";

export const ShortAreaSummarySection = ({ productArea }: { productArea: ProductArea }) => {
  return (
    <ResourceInfoContainer title="Kort fortalt">
      <TextWithLabel
        label="Områdetype"
        text={
          productArea.areaType ? intl.getString(productArea.areaType + "_AREATYPE_DESCRIPTION") : intl.dataIsMissing
        }
      />
      {productArea.nomId !== null && (
        <TextWithLabel label="Enhet i NOM" text={<NomOrgLink nomId={productArea.nomId} tekst={undefined} />} />
      )}
      <TextWithLabel label="Tagg" text={<Tags tags={productArea.tags} />} />
      <TextWithLabel
        label="Slack"
        text={productArea.slackChannel ? <SlackLink channel={productArea.slackChannel} /> : "Fant ikke Slack-kanal"}
      />
    </ResourceInfoContainer>
  );
};
