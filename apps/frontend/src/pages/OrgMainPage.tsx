import { Block } from "baseui/block";
import { useOrg } from "../api/OrgApi";
import { Redirect, useParams } from "react-router-dom";
import PageTitle from "../components/common/PageTitle";
import { TextWithLabel } from "../components/common/TextWithLabel";
import { Paragraph2, H5 } from "baseui/typography";
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
  leder: Ressurs[];
  koblinger: Kobling[];
}

interface Ressurs {
  ressurs: PersonInfo;
}

interface PersonInfo {
  nomId?: any;
  navIdent: any;
  personIdent?: any;
  koblinger?: Kobling[];
  lederFor?: any;
  ledere?: any[];
  person?: any;
  epost?: any;
  visningsNavn?: any;
  fornavn?: any;
  etternavn?: any;
}

interface Kobling {
  ressurs: PersonInfo;
  gyldigFom?: string;
  gyldigTom?: string;
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
    <RouteLink key={props.id} href={linkUri}>
      <Card
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
        <H5 color="#2A5486">{props.navn}</H5>
      </Card>
    </RouteLink>
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

const OrgEnhetInfo = (props: { enhetsnavn: string; agressoId: string; enhetsType: string }) => {
  return (
    <div style={{ width: "50rem" }}>
      <Block width="50%">
        <Paragraph2>
          Enhetsnavn: <label>{props.enhetsnavn}</label>
        </Paragraph2>
        <Paragraph2>
          AgressoId: <label>{props.agressoId}</label>
        </Paragraph2>
        <Paragraph2>
          Enhetstype: <label>{props.enhetsType}</label>
        </Paragraph2>
      </Block>
    </div>
  );
};

const OrgLeder = (props: { navn: string; navIdent: string }) => {
  return (
    <div>
      <Paragraph2>
        {props.navn} (<RouteLink href={"/resource/".concat(props.navIdent)}>{props.navIdent}</RouteLink>)
      </Paragraph2>
    </div>
  );
};

const OrgRessurs = (props: { navn: string; navIdent: string }) => {
  return (
    <div>
      <Paragraph2>
        <RouteLink href={"/resource/".concat(props.navIdent)}>
          {props.navn} ({props.navIdent})
        </RouteLink>
      </Paragraph2>
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

  const orgLederInfo: { navn: string; navIdent: string }[] = oe.leder.map((lInfo) => {
    return { navn: lInfo.ressurs.visningsNavn, navIdent: lInfo.ressurs.navIdent };
  });

  const orgRessurs: { navn: string; navIdent: string }[] = oe.koblinger.map((or) => {
    return { navn: or.ressurs.visningsNavn, navIdent: or.ressurs.navIdent };
  });
  return (
    <Block>
      <PageTitle title={oe.navn} />
      {overenheter.length === 0 ? (
        <TextWithLabel label={"NAV hierarki:"} text={"Ingen enheter over"} />
      ) : (
        <Block>
          <TextWithLabel
            label={"NAV hierarki:"}
            text={orgHierarki.map((hierarkiData, index) => (
              <OrgHierarki key={hierarkiData.id} navn={hierarkiData.navn} id={hierarkiData.id} cIndex={index} />
            ))}
          />
        </Block>
      )}

      <Block>
        <Block display="flex" width="80%" marginTop="4em">
          {<TextWithLabel width="50%" label={"Info"} text={<OrgEnhetInfo enhetsnavn={oe.navn} agressoId={oe.agressoId} enhetsType={"enhetstype"} />} />}

          <TextWithLabel
            width="40%"
            label={"Leder"}
            text={orgLederInfo.map((lederData) => (
              <OrgLeder key={lederData.navIdent} navn={lederData.navn} navIdent={lederData.navIdent} />
            ))}
          />
        </Block>
        {orgRessurs.length === 0 ? (
          <TextWithLabel label={"Ressurser"} text={"Ingen ressurser i denne enheten"} />
        ) : (
          <TextWithLabel
            marginTop="8em"
            label={"Ressurser"}
            text={
              <Block display={"grid"} gridTemplateColumns={"repeat(auto-fill, minmax(400px, 1fr))"}>
                {orgRessurs.map((rData) => (
                  <OrgRessurs key={rData.navIdent} navn={rData.navn} navIdent={rData.navIdent} />
                ))}
              </Block>
            }
          />
        )}
      </Block>
      {underenheter.length === 0 ? (
        <TextWithLabel marginTop="4em" label={"Underenheter"} text={"Ingen underheter i denne enheten"} />
      ) : (
        <TextWithLabel
          marginTop="4em"
          label={"Underenheter"}
          text={
            <Block display="flex" flexWrap>
              {underenheter
                .sort((a, b) => (a.navn < b.navn ? -1 : 1))
                .map((ue) => (
                  <OrgEnhetCard key={ue.id} navn={ue.navn} id={ue.id} />
                ))}
            </Block>
          }
        />
      )}
    </Block>
  );
};
