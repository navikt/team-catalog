import { useState } from "react";

import User from "../assets/person.svg";
import { env } from "../util/env";

export const resourceImageLink = (navIdent: string, forceUpdate = false) =>
  `${env.teamCatalogBaseUrl}/resource/${navIdent}/photo` + (forceUpdate ? "?forceUpdate=true" : "");

export const UserImage = (properties: { ident: string; size: string }) => {
  const { size, ident } = properties;
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);

  const commonStyles = {
    width: size,
    height: size,
    borderRadius: "100%",
  };

  const shouldDisplayPlaceholderImage = loading || errorLoading;

  const placeholderImage = (
    <img
      alt={`Profilbilde ${ident}`}
      src={User}
      style={{
        display: shouldDisplayPlaceholderImage ? "initial" : "none",
        ...commonStyles,
      }}
    />
  );

  const imageTag = (
    <img
      alt={`Profilbilde ${ident}`}
      onError={() => {
        setLoading(false);
        setErrorLoading(true);
      }}
      onLoad={() => {
        setLoading(false);
        setErrorLoading(false);
      }}
      src={resourceImageLink(ident)}
      style={{
        display: shouldDisplayPlaceholderImage ? "none" : "initial",
        ...commonStyles,
      }}
    />
  );

  return (
    <div>
      {placeholderImage}
      {imageTag}
    </div>
  );
};
