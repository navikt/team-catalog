import { css } from "@emotion/css";
import { Heading } from "@navikt/ds-react";

import emailIcon from "../../assets/emailIcon.svg";
import fromDateIcon from "../../assets/fromDateIcon.svg";
import identIcon from "../../assets/identIcon.svg";
import type { Resource } from "../../constants";
import { SmallDivider } from "../Divider";
import { TextWithLabel } from "../TextWithLabel";

const rowStyling = css`
  display: flex;
  margin-bottom: 1rem;
`;
const iconDivStyling = css`
  align-self: center;
  margin-right: 2rem;
  margin-top: 0.8rem;
  height: 80px;
`;

type AboutUsSectionProperties = {
  resource: Resource;
};

const ShortSummaryResource = (properties: AboutUsSectionProperties) => {
  const { resource } = properties;

  return (
    <div>
      <Heading size="medium">Kort fortalt</Heading>
      <SmallDivider />
      <div className={rowStyling}>
        <div className={iconDivStyling}>
          {" "}
          <img alt="Lokasjon" src={identIcon} />
        </div>
        <TextWithLabel label="NAV-ident" text={resource.navIdent} />
      </div>

      <div className={rowStyling}>
        <div className={iconDivStyling}>
          {" "}
          <img alt="E-post" src={emailIcon} />
        </div>
        <TextWithLabel label="E-post" text={resource.email} />
      </div>

      <div className={rowStyling}>
        <div className={iconDivStyling}>
          {" "}
          <img alt="Startdato" src={fromDateIcon} />
        </div>
        <TextWithLabel label="Startdato" text={resource.startDate} />
      </div>
    </div>
  );
};

export default ShortSummaryResource;
