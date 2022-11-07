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
      {properties.tags.map((t: string, index: number) => (
        <Link key={t} to={"/tag/" + t}>
          {t} {index + 1 < properties.tags.length ? ", " : ""}
        </Link>
      ))}
    </div>
  );
};

const ShortAreaSummarySection = (properties: ShortAreaSummaryProperties) => {
  const { productArea } = properties;
  return (
    <div>
      <Heading
        className={css`
          font-size: 22px;
          font-weight: 600;
        `}
        size="medium"
      >
        Kort fortalt
      </Heading>
      <SmallDivider />
      <div
        className={css`
          display: flex;
          flex-direction: column;
          gap: 1rem;
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
