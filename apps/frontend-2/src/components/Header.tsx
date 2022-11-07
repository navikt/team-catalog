import { css } from "@emotion/css";
import { ExternalLink } from "@navikt/ds-icons";
import { Link } from "@navikt/ds-react";

import TkLogo from "../assets/tkLogo.svg";
import { user } from "../services/User";
import AdminDropdown from "./header/AdminDropdown";
import HeaderDropdown from "./header/HeaderDropdown";
import NavItem from "./header/NavItem";
import { SearchBar } from "./SearchBar";

const headerRightSideStyle = css`
  display: flex;
  align-self: center;
`;

const navItemsStyle = css`
  display: flex;
  gap: var(--navds-spacing-4);
  justify-content: space-between;
  color: white;
`;

const Header = () => {
  return (
    <>
      <div
        className={css`
          background: var(--navds-global-color-deepblue-600);
          margin: 0 -100%;
          padding: 0 100%;
          display: flex;
          justify-content: space-between;
          height: 100px;
        `}
      >
        <Link href="/">
          <img className={css({ padding: "1rem" })} src={TkLogo} />
        </Link>
        <div className={navItemsStyle}>
          <NavItem label="Områder" url="/area" />
          <NavItem label="Klynger" url="/cluster" />
          <NavItem label="Team" url="/team" />
          <NavItem label="Fyrstikkalléen" url="/location/FA1" />
          <Link
            className={css`
              color: white;
            `}
            href="/org"
          >
            Organisasjon {<ExternalLink aria-hidden />}
          </Link>
          <Link
            className={css`
              color: white;
            `}
            href="/beta-off"
          >
            Gammel løsning
          </Link>
        </div>
        <div className={headerRightSideStyle}>
          {user.isAdmin() && <AdminDropdown />}
          {!user.isLoggedIn() && (
            <div>
              <Link href={"test"}>Logg inn</Link>
            </div>
          )}
          {user.isLoggedIn() && <HeaderDropdown />}
        </div>
      </div>
      <div
        className={css`
          display: flex;
          justify-content: center;
          background: var(--navds-global-color-deepblue-50);
          margin: 0 -100%;
          padding: 1rem 100%;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--navds-global-color-deepblue-600);
        `}
      >
        <SearchBar />
      </div>
    </>
  );
};

export default Header;
