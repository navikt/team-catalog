import { css } from "@emotion/css";
import { BodyShort } from "@navikt/ds-react";
import sortBy from "lodash/sortBy";
import { Link } from "react-router-dom";

import locationIcon from "../../assets/locationIcon.svg";
import officeDaysIcon from "../../assets/officeDaysIcon.svg";
import slackIcon from "../../assets/slackIcon.svg";
import type { ContactAddress, ProductArea, ProductTeam } from "../../constants";
import { ResourceInfoContainer } from "../common/ResourceInfoContainer";
import { SlackLink } from "../SlackLink";
import { TextWithLabel } from "../TextWithLabel";

function DisplayOfficeHours({ days, information }: { days: string[]; information?: string }) {
  const sortedDays = sortBy(
    days.map((day) => DISPLAY_DAYS[day as Day]),
    "order"
  );

  return (
    <div>
      <BodyShort
        className={css`
          margin-bottom: 5px;
          margin-top: 10px;
        `}
      >
        {sortedDays.map(({ day }) => day).join(", ") || "Ingen planlagte kontordager"}
      </BodyShort>
      {information && (
        <BodyShort
          className={css`
            margin-top: 0;
          `}
        >
          {information}
        </BodyShort>
      )}
    </div>
  );
}

type Day = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";
const DISPLAY_DAYS = {
  MONDAY: {
    day: "Mandag",
    order: 0,
  },
  TUESDAY: {
    day: "Tirsdag",
    order: 1,
  },
  WEDNESDAY: {
    day: "Onsdag",
    order: 2,
  },
  THURSDAY: {
    day: "Torsdag",
    order: 3,
  },
  FRIDAY: {
    day: "Fredag",
    order: 4,
  },
};

const containerCss = css`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

interface LocationSectionProperties {
  team: ProductTeam;
  productArea?: ProductArea;
  contactAddresses?: ContactAddress[];
}
const LocationSection = (properties: LocationSectionProperties) => {
  const { team } = properties;

  return (
    <ResourceInfoContainer title="Her finner du oss">
      {team.officeHours && (
        <div className={containerCss}>
          <img alt="Lokasjon" src={locationIcon} />
          <TextWithLabel
            label={"Lokasjon"}
            text={
              <Link to={`/location/${team.officeHours?.location.code}`}>{team.officeHours?.location.displayName}</Link>
            }
          />
        </div>
      )}

      <div className={containerCss}>
        <img alt="Slack kanal" src={slackIcon} />
        <TextWithLabel
          label="Slack"
          text={!team.slackChannel ? "Fant ikke slack kanal" : <SlackLink channel={team.slackChannel} />}
        />
      </div>

      <div className={containerCss}>
        <img alt="Kontaktperson" src={slackIcon} />
        <TextWithLabel
          label="Kontaktperson"
          text={
            team.contactPersonResource ? (
              <Link to={`/resource/${team.contactPersonResource.navIdent}`}>{team.contactPersonResource.fullName}</Link>
            ) : (
              "Ingen fast kontaktperson"
            )
          }
        />
      </div>

      {team.officeHours?.days && (
        <div className={containerCss}>
          <img alt="Planlagte kontordager ikon" src={officeDaysIcon} />
          <TextWithLabel
            label={"Planlagte kontordager"}
            text={<DisplayOfficeHours days={team.officeHours.days} information={team.officeHours.information} />}
          />
        </div>
      )}
    </ResourceInfoContainer>
  );
};

export default LocationSection;
