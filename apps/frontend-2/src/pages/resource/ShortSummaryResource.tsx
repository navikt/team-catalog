import { css } from "@emotion/css";
import dayjs from "dayjs";

import calendarIcon from "../../assets/calendarWhite.svg";
import emailIcon from "../../assets/emailWhite.svg";
import identIcon from "../../assets/identWhite.svg";
import { ResourceInfoContainer } from "../../components/common/ResourceInfoContainer";
import { TextWithLabel } from "../../components/TextWithLabel";
import type { Resource } from "../../constants";

const containerCss = css`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

type AboutUsSectionProperties = {
  resource: Resource;
};

export const ShortSummaryResource = (properties: AboutUsSectionProperties) => {
  const { resource } = properties;

  return (
    <ResourceInfoContainer title="Kort fortalt">
      <div className={containerCss}>
        <img alt="" src={identIcon} />
        <TextWithLabel label="NAV-ident" text={resource.navIdent} />
      </div>
      <div className={containerCss}>
        <img alt="" src={emailIcon} />
        <TextWithLabel label="E-post" text={resource.email} />
      </div>
      <div className={containerCss}>
        <img alt="" src={calendarIcon} />
        <TextWithLabel label="Startdato" text={dayjs(resource.startDate).format("DD.MM.YYYY")} />
      </div>
      {dayjs(resource.endDate).isBefore(new Date()) && (
        <div className={containerCss}>
          <img alt="" src={calendarIcon} />
          <TextWithLabel label="Sluttdato" text={dayjs(resource.endDate).format("DD.MM.YYYY")} />
        </div>
      )}
    </ResourceInfoContainer>
  );
};
