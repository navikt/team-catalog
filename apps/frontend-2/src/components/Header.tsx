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
      <div>
        <div
          className={cx(
            "banner-background",
            css`
              height: 100px;
              background: var(--a-deepblue-600);
            `
          )}
        />
        <nav
          className={css`
            display: flex;
            justify-content: space-between;
            height: ${headerHeigth};
            align-items: center;
            gap: 1rem;

            @media only screen and (width > 810px) {
              .desktop-navigation {
                display: inherit;
              }

              .mobile-navigation {
                display: none;
              }
            }

            @media only screen and (width <= 810px) {
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
      </div>
      <div
        className={css`
          height: 80px;
          display: flex;
          margin-bottom: 2rem;
          align-items: center;
          justify-content: center;
        `}
      >
        <div
          className={cx(
            "banner-background",
            css`
              height: 80px;
              background: var(--a-deepblue-50);
              border-bottom: 1px solid var(--a-deepblue-600);
            `
          )}
        />

        <div
          className={css`
            width: 500px;
            margin: 0 8px;
          `}
        >
          <SearchBar />
        </div>
      </div>
    </>
  );
};
