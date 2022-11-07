import { css } from "@emotion/css";
import { Link } from "@navikt/ds-react";
import { useMatch } from "react-router-dom";

interface navItemProperties {
  url: string;
  label: string;
}

const NavItem = (properties: navItemProperties) => {
  const routeMatch = !!useMatch(properties.url);

  return (
    <Link
      className={css`
        color: white;
        text-decoration-thickness: ${routeMatch ? 2 : 0}px;
        text-underline-offset: ${routeMatch ? 5 : 1}px;
        height: fit-content;
        text-decoration: ${routeMatch ? "underline white 2px" : "none"};
        &:hover {
          text-decoration: underline white 2px;
        }
      `}
      href={properties.url}
    >
      {properties.label}
    </Link>
  );
};

export default NavItem;
