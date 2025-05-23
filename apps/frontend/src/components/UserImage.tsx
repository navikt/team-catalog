import { css } from "@emotion/css";
import { useState } from "react";

import User from "../assets/person.svg";
import { useUnleashToggle } from "../hooks/useUnleashToggle";
import { env } from "../util/env";

export const resourceImageLink = (navIdent: string, forceUpdate = false) => {
  return `${env.teamCatalogBaseUrl}/resource/${navIdent}/photo` + (forceUpdate ? "?forceUpdate=true" : "");
};

export const resourceImageLinkNomAzure = (navIdent: string) => {
  return `/frackend/nom-azure/picture/${navIdent}`;
};

export const UserImage = ({ navIdent, size }: { navIdent: string; size: string }) => {
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);
  const shouldUseNomAzure = useUnleashToggle("teamcatalog.bilder.bruknomazure");

  const commonStyles = {
    width: size,
    height: size,
    borderRadius: "100%",
  };

  const shouldDisplayPlaceholderImage = loading || errorLoading;

  const placeholderImage = (
    <img
      alt={`Profilbilde ${navIdent}`}
      src={User}
      style={{
        display: shouldDisplayPlaceholderImage ? "initial" : "none",
        ...commonStyles,
      }}
    />
  );

  const imageTag = (
    <img
      alt=""
      key={navIdent}
      onError={() => {
        setLoading(false);
        setErrorLoading(true);
      }}
      onLoad={() => {
        setLoading(false);
        setErrorLoading(false);
      }}
      src={shouldUseNomAzure ? resourceImageLinkNomAzure(navIdent) : resourceImageLink(navIdent)}
      style={{
        display: shouldDisplayPlaceholderImage ? "none" : "initial",
        ...commonStyles,
      }}
    />
  );

  return (
    <div
      className={css`
        width: max-content;
      `}
    >
      {placeholderImage}
      {imageTag}
    </div>
  );
};
