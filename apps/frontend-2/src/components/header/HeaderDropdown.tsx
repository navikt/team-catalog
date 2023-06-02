import { css } from "@emotion/css";
import { MenuHamburgerIcon } from "@navikt/aksel-icons";
import { Button } from "@navikt/ds-react";
import { Dropdown } from "@navikt/ds-react-internal";
import type { ReactNode } from "react";
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
          <MenuListItemAsReactLocationLink to={`/resource/${user.ident}`}>Min side</MenuListItemAsReactLocationLink>
          <MenuListItemAsReactLocationLink to={`/user/notifications`}>Mine varsler</MenuListItemAsReactLocationLink>
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
      <MenuListItemAsReactLocationLink to="/area">Områder</MenuListItemAsReactLocationLink>
      <MenuListItemAsReactLocationLink to="/cluster">Klynger</MenuListItemAsReactLocationLink>
      <MenuListItemAsReactLocationLink to="/team">Team</MenuListItemAsReactLocationLink>
      <MenuListItemAsReactLocationLink to="/location/FA1">Fyrstikkalléen</MenuListItemAsReactLocationLink>
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
      <MenuListItemAsReactLocationLink to="/admin/audit">{intl.audit}</MenuListItemAsReactLocationLink>
      <MenuListItemAsReactLocationLink to="/admin/maillog">{intl.mailLog}</MenuListItemAsReactLocationLink>
      <MenuListItemAsReactLocationLink to="/admin/settings">{intl.settings}</MenuListItemAsReactLocationLink>
    </Dropdown.Menu.GroupedList>
  );
}

/**
 * Use this component to enforce that MenuItems that uses Link from React Location applies same styles as a native MenuItem.
 */
function MenuListItemAsReactLocationLink({ children, to }: { children: ReactNode; to: string }) {
  return (
    <Dropdown.Menu.List.Item
      as="span"
      className={css`
        &:focus-within {
          outline: none;
          box-shadow: inset 0 0 0 2px var(--a-border-focus);
        }
      `}
    >
      <ReactRouterLink
        className={css`
          width: 100%;

          &:focus-visible {
            outline: none;
            box-shadow: none;
          }

          &:active {
            background-color: var(--a-surface-action-active);
            color: var(--a-text-on-action);
          }
        `}
        to={to}
      >
        {children}
      </ReactRouterLink>
    </Dropdown.Menu.List.Item>
  );
}
