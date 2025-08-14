import { css } from "@emotion/css";
import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { Link as TraditionalLink } from "@navikt/ds-react";
import { Link as ClientSideRoutingLink, useMatch } from "react-router-dom";

interface NavItemProperties {
  url: string;
  label: string;
  external?: boolean;
  clientSide?: boolean;
  showExternalIcon?: boolean;
}

const style = css`
  color: white;
  text-decoration: none;
  text-decoration-thickness: 0;
  text-underline-offset: 1px;
  height: fit-content;
  gap: 6px;

  :hover {
    text-decoration: underline white 2px;
  }

  :focus {
    outline: 5px auto -webkit-focus-ring-color;
  }
`;

const styleOverridesIfRouteMatches = css`
  text-decoration: underline white 2px;
  text-decoration-thickness: 2px;
  text-underline-offset: 5px;
`;

export const NavItem = ({
  url,
  label,
  showExternalIcon = false,
  clientSide = true,
  external = false,
}: NavItemProperties) => {
  const routeMatch = !!useMatch(`${url}/*`);

  if (!clientSide) {
    const externalProperties = external
      ? { rel: "noopener noreferrer", target: "_blank", "aria-label": "Åpnes i ny fane" }
      : {};
    return (
      <TraditionalLink
        className={css(style, routeMatch && styleOverridesIfRouteMatches)}
        href={url}
        {...externalProperties}
      >
        {label}
        {showExternalIcon && <ExternalLinkIcon width="16px" />}
      </TraditionalLink>
    );
  }

  return (
    <ClientSideRoutingLink className={css(style, routeMatch && styleOverridesIfRouteMatches)} to={url}>
      {label}
    </ClientSideRoutingLink>
  );
};
