import { useState } from "react";

import User from "../assets/person.svg";
import { env } from "../util/env";

export const resourceImageLink = (navIdent: string, forceUpdate = false) =>
  `${env.teamCatalogBaseUrl}/resource/${navIdent}/photo` + (forceUpdate ? "?forceUpdate=true" : "");

export const UserImage = ({ navIdent, size }: { navIdent: string; size: string }) => {
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
      onError={() => {
        setLoading(false);
        setErrorLoading(true);
      }}
      onLoad={() => {
        setLoading(false);
        setErrorLoading(false);
      }}
      src={resourceImageLink(navIdent)}
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
