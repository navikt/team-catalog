import { css } from "@emotion/css";
import { useState } from "react";

import User from "../assets/person.svg";

export const resourceImageLinkNomAzure = (navIdent: string) => {
  return `/frackend/nom-azure/picture/${navIdent}`;
};

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
      key={navIdent}
      onError={() => {
        setLoading(false);
        setErrorLoading(true);
      }}
      onLoad={() => {
        setLoading(false);
        setErrorLoading(false);
      }}
      src={resourceImageLinkNomAzure(navIdent)}
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
