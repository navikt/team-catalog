import { css } from "@emotion/css";
import { BodyShort } from "@navikt/ds-react";
import { Link } from "react-router-dom";

export function Tags({ tags }: { tags: string[] }) {
  if (tags.length <= 0) {
    return <BodyShort>Ingen tags</BodyShort>;
  }

  return (
    <div
      className={css`
        display: flex;
        flex-wrap: wrap;
      `}
    >
      {tags.map((tag: string, index: number) => (
        <Link key={tag} to={"/tag/" + tag}>
          {tag} {index + 1 < tags.length ? ", " : ""}
        </Link>
      ))}
    </div>
  );
}
