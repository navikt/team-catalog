import { css } from "@emotion/css";
import { BodyShort, Heading } from "@navikt/ds-react";
import React from "react";
import { Link } from "react-router-dom";

import type { ProductArea } from "../../constants";
import { intl } from "../../util/intl/intl";
import { SmallDivider } from "../Divider";
import { SlackLink } from "../SlackLink";
import { TextWithLabel } from "../TextWithLabel";

interface ShortAreaSummaryProperties {
  productArea: ProductArea;
}

const DisplayTags = (properties: { tags: string[] }) => {
  if (properties.tags.length <= 0) return <BodyShort>Ingen tags</BodyShort>;
  return (
    <div
      className={css`
        display: flex;
        flex-wrap: wrap;
      `}
    >
      {properties.tags.map((tag, index) => (
        <Link key={tag} to={"/tag/" + tag}>
          {`${index === 0 ? "" : ", "}${tag}`}
        </Link>
      ))}
    </div>
  );
};

const ShortAreaSummarySection = (properties: ShortAreaSummaryProperties) => {
  const { productArea } = properties;
  return (
    <div>
      <Heading level="2" size="medium">
        Kort fortalt
      </Heading>
      <SmallDivider />
      <div
        className={css`
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: var(--navds-spacing-4);
        `}
      >
        <TextWithLabel
          label={"Områdetype"}
          text={
            productArea.areaType ? intl.getString(productArea.areaType + "_AREATYPE_DESCRIPTION") : intl.dataIsMissing
          }
        />
        <TextWithLabel label="Tagg" text={<DisplayTags tags={productArea.tags} />} />
        <TextWithLabel
          label="Slack"
          text={!productArea.slackChannel ? "Fant ikke slack kanal" : <SlackLink channel={productArea.slackChannel} />}
        />
      </div>
    </div>
  );
};

export default ShortAreaSummarySection;
