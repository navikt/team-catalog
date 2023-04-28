import { css } from "@emotion/css";
import { Link } from "react-router-dom";

import TkLogo from "../assets/tkLogo.svg";
import { env } from "../util/env";
import { AdminDropdown } from "./header/AdminDropdown";
import { HeaderDropdown } from "./header/HeaderDropdown";
import { NavItem } from "./header/NavItem";
import { SearchBar } from "./SearchBar";

const headerRightSideStyle = css`
  display: flex;
  align-self: center;
`;

const navItemsStyle = css`
  display: flex;
  gap: var(--a-spacing-6);
  align-items: center;
  justify-content: space-between;
  color: white;
`;

export const headerHeigth = "100px";

export const Header = () => {
  return (
    <>
      <div
        className={css`
          background: var(--a-deepblue-600);
          margin: 0 -100%;
          padding: 0 100%;
          display: flex;
          justify-content: space-between;
          height: ${headerHeigth};
        `}
      >
        <Link to="/">
          <img alt={"Forside Teamkatalogen"} className={css({ padding: "1rem" })} src={TkLogo} />
        </Link>
        <div className={navItemsStyle}>
          <NavItem label="Områder" url="/area" />
          <NavItem label="Klynger" url="/cluster" />
          <NavItem label="Team" url="/team" />
          <NavItem label="Fyrstikkalléen" url="/location/FA1" />
          <div
            className={css`
              background: white;
              height: 20px;
              width: 1px;
            `}
          />
          <NavItem
            clientSide={false}
            external
            label="Organisasjon"
            showExternalIcon
            url={env.isDev ? "https://nom.dev.nav.no/org" : "https://nom.nav.no/org"}
          />
        </div>
        <div className={headerRightSideStyle}>
          <div aria-label={"Admin meny"} role={"navigation"}>
            <AdminDropdown />
          </div>
          <div aria-label={"Bruker meny"} role={"navigation"}>
            <HeaderDropdown />
          </div>
        </div>
      </div>
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
