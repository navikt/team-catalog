import { css } from "@emotion/css";
import { Collapse, Expand, InformationFilled } from "@navikt/ds-icons";
import { Heading } from "@navikt/ds-react";
import { useState } from "react";

export function BetaBanner() {
  const [showBetaInfo, setShowBetaInfo] = useState(false);

  return (
    <div
      className={css`
        display: flex;
        flex-direction: column;
        background: #deecef;
        margin: 0 -100%;
        padding: 0 100%;
        margin-top: -2rem;
        border-bottom: 1px solid var(--navds-global-color-lightblue-800);
      `}
    >
      <button
        className={css`
          border: none;
          background: inherit;

          display: flex;
          align-items: center;
          align-self: center;
          gap: 0.5rem;
          cursor: pointer;
          height: 50px;
        `}
        onClick={() => setShowBetaInfo((previousState) => !previousState)}
      >
        <InformationFilled />
        <Heading size="small">Løsningen er i pilot</Heading>
        {showBetaInfo ? <Collapse /> : <Expand />}
      </button>
      {showBetaInfo && (
        <div
          className={css`
            padding-bottom: 2rem;
          `}
        >
          Velkommen til nye Teamkatalogen!
          <br />
          Gammel versjon (med full funksjonalitet) finner du her:{" "}
          <a href="https://teamkatalog.nav.no/beta-off">https://teamkatalog.nav.no/beta-off</a> <br />
          Vi er i beta med det nye designet, og mye funksjonalitet er ikke på plass enda. Vi vil allikevel gå live med
          betaen så vi kan få feedback samtidig som vi videreutvikler på det som mangler. <br />
          <br />
          Kjente mangler inkluderer:
          <ul>
            <li>Ikke støtte for endringer enda</li>
            <li>Grafer og visualisering er ikke på plass</li>
            <li>Eksportfunksjoner</li>
            <li>Tabellvisninger</li>
            <li>Mobilvennlighet</li>
          </ul>
          <br />
          Bytt mellom beta og gammel løsning gjennom lenkene i menyen. <br />
          Vi håper du liker det! <br />
          /Team Org
        </div>
      )}
    </div>
  );
}
