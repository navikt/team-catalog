import { css, cx } from "@emotion/css";
import { Link } from "react-router-dom";

import TkLogo from "../assets/tkLogo.svg";
import { env } from "../util/env";
import { HeaderDropdown } from "./header/HeaderDropdown";
import { NavItem } from "./header/NavItem";
import { SearchBar } from "./SearchBar";

export const headerHeigth = "100px";

export const Header = () => {
  return (
    <>
      <nav
        className={css`
          background: var(--a-deepblue-600);
          margin: 0 -100%;
          padding: 0 100%;
          display: flex;
          justify-content: space-between;
          height: ${headerHeigth};
          align-items: center;
          gap: 1rem;

          @media only screen and (min-width: 751px) {
            .desktop-navigation {
              display: inherit;
            }

            .mobile-navigation {
              display: none;
            }
          }
          @media only screen and (max-width: 750px) {
            .desktop-navigation {
              display: none;
            }

            .mobile-navigation {
              display: inherit;
            }
          }
        `}
      >
        <Link to="/">
          <img alt={"Forside Teamkatalogen"} className={css({ padding: "1rem" })} src={TkLogo} />
        </Link>
        <div
          className={cx(
            "desktop-navigation",
            css`
              display: flex;
              flex-wrap: wrap;
              gap: var(--a-spacing-4);
              align-items: center;
              justify-content: space-between;
              color: white;
            `
          )}
        >
          <NavItem label="Områder" url="/area" />
          <NavItem label="Klynger" url="/cluster" />
          <NavItem label="Team" url="/team" />
          <NavItem label="Fyrstikkalléen" url="/location/FA1" />
          <NavItem
            clientSide={false}
            external
            label="Organisasjon"
            showExternalIcon
            url={env.isDev ? "https://nom.dev.nav.no/org" : "https://nom.nav.no/org"}
          />
        </div>
        <HeaderDropdown />
      </nav>
      <div
        className={css`
          display: flex;
          justify-content: center;
          background: var(--a-deepblue-50);
          margin: 0 -100%;
          padding: 1rem 100%;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--a-deepblue-600);
        `}
      >
        <SearchBar />
      </div>
    </>
  );
};
