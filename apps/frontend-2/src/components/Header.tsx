import { css } from "@emotion/css";
import { Expand } from "@navikt/ds-icons";
import { ExternalLink } from "@navikt/ds-icons";
import { Button, Link, Search } from "@navikt/ds-react";
import { Dropdown } from "@navikt/ds-react-internal";
import { useLocation } from "react-router-dom";

import TkLogo from "../assets/tkLogo.svg";
import { user } from "../services/User";
import { intl } from "../util/intl/intl";
import AdminDropdown from "./header/AdminDropdown";
import HeaderDropdown from "./header/HeaderDropdown";
import NavItem from "./header/NavItem";
import {SearchBar} from "./SearchBar";

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
              <img className={css({ padding: "1rem" })} src={TkLogo} />
            </Link>
          </div>
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
        <SearchBar />
      </div>
    </div>
  );
};

export default Header;
