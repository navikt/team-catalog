import { css } from "@emotion/css";
import { ChevronDownIcon } from "@navikt/aksel-icons";
import { Button } from "@navikt/ds-react";
import { Dropdown } from "@navikt/ds-react-internal";
import { Link } from "react-router-dom";

import { useUser } from "../../hooks/useUser";

const dropdownStyle = css`
  background-color: #005077;
  color: white;
  text-decoration: underline;
  border-color: white;
  box-shadow: inset 0 0 0 1px white;
  border-radius: 8px;
  :focus {
    box-shadow: inset 0 0 0 2px white;
  }
  :hover {
    color: white;
    box-shadow: inset 0 0 0 2px white;
    background-color: #005077;
  }
`;

export const HeaderDropdown = () => {
  const user = useUser();
  if (!user.loggedIn) {
    return <></>;
  }

  return (
    <Dropdown>
      <Button
        as={Dropdown.Toggle}
        className={dropdownStyle}
        icon={<ChevronDownIcon aria-hidden />}
        iconPosition="right"
        variant="secondary"
      >
        {user.ident}
      </Button>
      <Dropdown.Menu placement="bottom">
        <Dropdown.Menu.GroupedList>
          <Dropdown.Menu.GroupedList.Heading>Navn: {user.name}</Dropdown.Menu.GroupedList.Heading>
          <Dropdown.Menu.GroupedList.Item tabIndex={-1}>
            <Link to={`/resource/${user.ident}`}>Min side</Link>
          </Dropdown.Menu.GroupedList.Item>
          <Dropdown.Menu.GroupedList.Item tabIndex={-1}>
            <Link to={`/user/notifications`}>Mine varsler</Link>
          </Dropdown.Menu.GroupedList.Item>
          <Dropdown.Menu.GroupedList.Item tabIndex={-1}>
            {/* <Link to={`/logout?redirect_uri=${props.location}`}>Logg ut</a> */}
          </Dropdown.Menu.GroupedList.Item>
        </Dropdown.Menu.GroupedList>
      </Dropdown.Menu>
    </Dropdown>
  );
};
