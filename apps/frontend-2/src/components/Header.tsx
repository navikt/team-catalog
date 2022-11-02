import { css } from "@emotion/css";
import { Button, Link, Search } from "@navikt/ds-react";
import { Dropdown } from "@navikt/ds-react-internal";

import { user } from "../services/User";
import TkLogo from "../assets/tkLogo.svg";
import { Expand } from "@navikt/ds-icons";
import { ExternalLink } from "@navikt/ds-icons";
import { useLocation } from "react-router-dom";
import NavItem from "./header/NavItem";
import HeaderDropdown from "./header/HeaderDropdown";
import { intl } from "../util/intl/intl";
import AdminDropdown from "./header/AdminDropdown";

const headerStyle = css`
  display: flex;
  flex-direction: column;
`;

const headerRightSideStyle = css`
  display: flex;
  align-self: center;
`;

const loggedInBurgerMenu = css`
  display: flex;
  align-items: center;
`;

const topHeaderStyle = css`
  background-color: #005077;
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const topContentStyle = css`
  width: 75%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const bottomHeaderStyle = css`
  display: flex;
  width: 100%;
  padding-top: 1rem;
  padding-bottom: 1rem;
  align-items: center;
  justify-content: center;
  background-color: #e6f1f8;
  border-bottom: 1px solid #005077;
`;

const searchBarStyle = css`
  width: 488px;
`;

const navItemsStyle = css`
  width: 488px;
  display: flex;
  justify-content: space-between;
  color: white;
`;

const Header = () => {
  console.log(useLocation().pathname.split("/")[1]);
  return (
    <div className={headerStyle}>
      <div className={topHeaderStyle}>
        <div className={topContentStyle}>
          <div>
            <Link href="/">
              <img src={TkLogo} className={css({ padding: "1rem" })} />
            </Link>
          </div>
          <div className={navItemsStyle}>
            <NavItem url="/area" label="Områder" />
            <NavItem url="/cluster" label="Klynger" />
            <NavItem url="/team" label="Team" />
            <NavItem url="/location/FA1" label="Fyrstikkalléen" />
            <Link
              href="/org"
              className={css`
                color: white;
              `}
            >
              Organisasjon {<ExternalLink aria-hidden />}
            </Link>
          </div>
          <div className={headerRightSideStyle}>
            {user.isAdmin() && <AdminDropdown />}
            {!user.isLoggedIn() && (
              <div>
                {/* <Link href={`/login?redirect_uri=${props.location}`}>Logg inn</Link> */}
                <Link href={"test"}>Logg inn</Link>
              </div>
            )}
            {user.isLoggedIn() && <HeaderDropdown />}
          </div>
        </div>
      </div>
      <div className={bottomHeaderStyle}>
        <form className={searchBarStyle}>
          <Search
            label="Søk alle NAV sine sider"
            size="medium"
            variant="secondary"
          />
        </form>
      </div>
    </div>
  );
};

export default Header;
