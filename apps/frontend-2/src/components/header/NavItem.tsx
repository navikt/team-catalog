import { css } from "@emotion/css";
import { ExternalLink } from "@navikt/ds-icons";
import { Link as TraditionalLink } from "@navikt/ds-react";
import { Link as ClientSideRoutingLink, useMatch } from "react-router-dom";

interface navItemProperties {
  url: string;
  label: string;
  external?: boolean;
}

const style = css`
  color: white;
  text-decoration-thickness: 0;
  text-underline-offset: 1px;
  height: fit-content;
  text-decoration: none;
  gap: 6px;
  &:hover {
    text-decoration: underline white 2px;
  }
`;

const styleOverridesIfRouteMatches = css`
  text-decoration-thickness: 2px;
  text-underline-offset: 5px;
  text-decoration: underline white 2px;
`;

const NavItem = ({ url, label, external = false }: navItemProperties) => {
  const routeMatch = !!useMatch(url);

  if (external) {
    return (
      <TraditionalLink
        className={css(style, routeMatch && styleOverridesIfRouteMatches)}
        href={url}
        rel="noopener noreferrer"
        target="_blank"
      >
        {label}
        <ExternalLink width="16px" />
      </TraditionalLink>
    );
  }

  return (
    <ClientSideRoutingLink className={css(style, routeMatch && styleOverridesIfRouteMatches)} to={url}>
      {label}
    </ClientSideRoutingLink>
  );
};

export default NavItem;
