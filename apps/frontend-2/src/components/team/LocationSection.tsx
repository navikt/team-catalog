import { css } from "@emotion/css";
import { BodyShort } from "@navikt/ds-react";
import sortBy from "lodash/sortBy";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";

import { getResourceById } from "../../api";
import buildingIcon from "../../assets/buildingWhite.svg";
import calendarIcon from "../../assets/calendarWhite.svg";
import contactPerson from "../../assets/contactPersonWhite.svg";
import slackIcon from "../../assets/slackWhite.svg";
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
  contactAddresses: ContactAddress[];
}
export const LocationSection = (properties: LocationSectionProperties) => {
  const { team } = properties;

  const fetchContactPersonResource = useQuery({
    queryKey: ["getResourceById", team.contactPersonIdent],
    queryFn: () => getResourceById(team.contactPersonIdent),
    enabled: !!team.contactPersonIdent,
  });

  return (
    <ResourceInfoContainer title="Her finner du oss">
      {team.officeHours?.location && (
        <div className={containerCss}>
          <img alt="" src={buildingIcon} />
          <TextWithLabel
            label={"Lokasjon"}
            text={
              <Link to={`/location/${team.officeHours.location.code}`}>{team.officeHours.location.displayName}</Link>
            }
          />
        </div>
      )}

      {team.officeHours?.days && (
        <div className={containerCss}>
          <img alt="" src={calendarIcon} />
          <TextWithLabel
            label={"Planlagte kontordager"}
            text={<DisplayOfficeHours days={team.officeHours.days} information={team.officeHours.information} />}
          />
        </div>
      )}

      <div className={containerCss}>
        <img alt="" src={slackIcon} />
        <TextWithLabel
          label="Slack"
          text={team.slackChannel ? <SlackLink channel={team.slackChannel} /> : "Fant ikke slack kanal"}
        />
      </div>

      <div className={containerCss}>
        <img alt="" src={contactPerson} />
        <TextWithLabel
          label="Kontaktperson"
          text={
            fetchContactPersonResource.data ? (
              <Link to={`/resource/${fetchContactPersonResource.data.navIdent}`}>
                {fetchContactPersonResource.data.fullName}
              </Link>
            ) : (
              "Ingen fast kontaktperson"
            )
          }
        />
      </div>
    </ResourceInfoContainer>
  );
};
