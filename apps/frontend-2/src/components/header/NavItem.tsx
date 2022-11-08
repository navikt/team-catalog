import { css } from "@emotion/css";
import { ExternalLink } from "@navikt/ds-icons";
import { Link } from "@navikt/ds-react";
import { useMatch } from "react-router-dom";

interface navItemProperties {
  url: string;
  label: string;
  external?: boolean;
}

const NavItem = ({ url, label, external = false }: navItemProperties) => {
  const routeMatch = !!useMatch(url);

  const additionalProperties = external ? { rel: "noopener noreferrer", target: "_blank" } : {};

  return (
    <Link
      className={css`
        color: white;
        text-decoration-thickness: ${routeMatch ? 2 : 0}px;
        text-underline-offset: ${routeMatch ? 5 : 1}px;
        height: fit-content;
        text-decoration: ${routeMatch ? "underline white 2px" : "none"};
        gap: 6px;
        &:hover {
          text-decoration: underline white 2px;
        }
      `}
      href={url}
      {...additionalProperties}
    >
      {label}
      {external && <ExternalLink width="16px" />}
    </Link>
  );
};

export default NavItem;
