import { css } from "@emotion/css";
import { BodyShort } from "@navikt/ds-react";
import React from "react";
import { Link } from "react-router-dom";

export function DisplayTags(properties: { tags: string[] }) {
  if (properties.tags.length <= 0) {
    return <BodyShort>Ingen tags</BodyShort>;
  }

  return (
    <div
      className={css`
        display: flex;
        flex-wrap: wrap;
      `}
    >
      {properties.tags.map((tag: string, index: number) => (
        <Link key={tag} to={"/tag/" + tag}>
          {tag} {index + 1 < properties.tags.length ? ", " : ""}
        </Link>
      ))}
    </div>
  );
}
