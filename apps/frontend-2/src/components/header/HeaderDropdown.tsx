import { css } from "@emotion/css";
import { MenuHamburgerIcon } from "@navikt/aksel-icons";
import { Button, Link } from "@navikt/ds-react";
import { Dropdown } from "@navikt/ds-react-internal";
import { Link as ReactRouterLink } from "react-router-dom";

import { Group, userHasGroup, useUser } from "../../hooks/useUser";
import { intl } from "../../util/intl/intl";

export const HeaderDropdown = () => {
  const user = useUser();
  if (!user.loggedIn) {
    return <></>;
  }

  return (
    <Dropdown>
      <Button
        as={Dropdown.Toggle}
        className={css`
          border: 1px solid white;
        `}
        icon={<MenuHamburgerIcon aria-hidden color="white" />}
      />
      <Dropdown.Menu placement="bottom">
        <NavigationItems />
        <Dropdown.Menu.GroupedList>
          <Dropdown.Menu.GroupedList.Heading>{user.name}</Dropdown.Menu.GroupedList.Heading>
          <Dropdown.Menu.GroupedList.Item>
            <ReactRouterLink to={`/resource/${user.ident}`}>Min side</ReactRouterLink>
          </Dropdown.Menu.GroupedList.Item>
          <Dropdown.Menu.GroupedList.Item>
            <ReactRouterLink to={`/user/notifications`}>Mine varsler</ReactRouterLink>
          </Dropdown.Menu.GroupedList.Item>
        </Dropdown.Menu.GroupedList>
        <AdminItems />
      </Dropdown.Menu>
    </Dropdown>
  );
};

function NavigationItems() {
  return (
    <Dropdown.Menu.GroupedList className="mobile-navigation">
      <Dropdown.Menu.GroupedList.Heading>Navigasjon</Dropdown.Menu.GroupedList.Heading>
      <Dropdown.Menu.GroupedList.Item>
        <Link as={ReactRouterLink} to="/area">
          Områder
        </Link>
      </Dropdown.Menu.GroupedList.Item>
      <Dropdown.Menu.GroupedList.Item>
        <Link as={ReactRouterLink} to="/cluster">
          Klynger
        </Link>
      </Dropdown.Menu.GroupedList.Item>
      <Dropdown.Menu.GroupedList.Item>
        <Link as={ReactRouterLink} to="/team">
          Team
        </Link>
      </Dropdown.Menu.GroupedList.Item>
      <Dropdown.Menu.GroupedList.Item>
        <Link as={ReactRouterLink} to="/location/FA1">
          Fyrstikkalléen
        </Link>
      </Dropdown.Menu.GroupedList.Item>
    </Dropdown.Menu.GroupedList>
  );
}

function AdminItems() {
  const user = useUser();
  if (!userHasGroup(user, Group.ADMIN)) {
    return <></>;
  }

  return (
    <Dropdown.Menu.GroupedList>
      <Dropdown.Menu.GroupedList.Heading>Admin</Dropdown.Menu.GroupedList.Heading>
      <Dropdown.Menu.GroupedList.Item>
        <ReactRouterLink to="/admin/audit">{intl.audit}</ReactRouterLink>
      </Dropdown.Menu.GroupedList.Item>
      <Dropdown.Menu.GroupedList.Item>
        <ReactRouterLink to="/admin/maillog">{intl.mailLog}</ReactRouterLink>
      </Dropdown.Menu.GroupedList.Item>
      <Dropdown.Menu.GroupedList.Item>
        <ReactRouterLink to="/admin/settings">{intl.settings}</ReactRouterLink>
      </Dropdown.Menu.GroupedList.Item>
    </Dropdown.Menu.GroupedList>
  );
}
