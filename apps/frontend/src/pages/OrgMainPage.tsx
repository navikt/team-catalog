import * as React from "react";
import { Block } from "baseui/block";
import { useOrg } from "../api/OrgApi";
import { Redirect, useParams } from "react-router-dom";
import PageTitle from "../components/common/PageTitle";
import { TextWithLabel } from "../components/common/TextWithLabel";
import { H1 } from "baseui/typography";
import { Card } from "baseui/card";
import RouteLink from "../components/common/RouteLink";
import { cardShadow } from "../components/common/Style";
import { marginAll } from "../components/Style";
import { theme } from "../util";

export interface OrgEnhet {
  agressoId: string;
  navn: string;
  gyldigFom?: string;
  gyldigTom?: string;
  organiseringer: OrgEnhetOrganisering[];
}

export interface OrgEnhetOrganisering {
  retning: "over" | "under";
  organisasjonsenhet: OrgEnhet;
}

export interface HierarkiData {
  navn: string;
  id: string;
}

const OrgEnhetCard = (props: { navn: string; id: string }) => {
  const linkUri = "/org/" + props.id;
  return (
    <Card
      key={props.id}
      overrides={{
        Root: {
          style: {
            ...cardShadow.Root.style,
            width: "450px",
            ...marginAll(theme.sizing.scale200),
          },
        },
      }}
    >
      <H1>{props.navn}</H1>
      <RouteLink href={linkUri}>Gå til enhet</RouteLink>
    </Card>
  );
};

const OrgHierarki = (props: { navn: string; id: string; cIndex: number }) => {
  return (
    <div>
      <RouteLink href={props.id} style={{ paddingLeft: String(props.cIndex * 27) + "px" }}>
        {props.navn}
      </RouteLink>
    </div>
  );
};

export const OrgMainPage = () => {
  const { id: orgId } = useParams<any>();
  const { org, orgHierarki } = useOrg(orgId);

  if (orgId === undefined) {
    return <Redirect to={"/org/NAV"} />;
  }
  if (!org) {
    return <div>Laster</div>;
  }

  const oe: OrgEnhet = org as OrgEnhet;
  const underenheter: { navn: string; id: string }[] = oe.organiseringer
    .filter((oee) => oee.retning === "under")
    .map((ue) => {
      return { navn: ue.organisasjonsenhet.navn, id: ue.organisasjonsenhet.agressoId };
    });

  const overenheter: { navn: string; id: string }[] = oe.organiseringer
    .filter((oee) => oee.retning === "over")
    .map((ue) => {
      return { navn: ue.organisasjonsenhet.navn, id: ue.organisasjonsenhet.agressoId };
    });
  const ingenOverenhet = overenheter.length === 0;
  const ingenUnderenheter = underenheter.length === 0;

  return (
    <Block>
      <PageTitle title={oe.navn} />
      {ingenOverenhet ? null : (
        <Block>
          <TextWithLabel
            label={"NAV hierarki:"}
            text={orgHierarki.map((hierarkiData, index) => (
              <OrgHierarki key={hierarkiData.id} navn={hierarkiData.navn} id={hierarkiData.id} cIndex={index} />
            ))}
          />
        </Block>
      )}

      {ingenUnderenheter ? (
        <Block>{/* Insert enhets info her */}</Block>
      ) : (
        <Block display="flex" flexWrap>
          {underenheter.map((ue) => (
            <OrgEnhetCard key={ue.id} navn={ue.navn} id={ue.id} />
          ))}
        </Block>
      )}
    </Block>
  );
};
