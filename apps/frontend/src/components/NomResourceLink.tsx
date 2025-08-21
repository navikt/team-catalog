import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { Link } from "@navikt/ds-react";

import { env } from "../util/env";
import { linkWithUnderline } from "../util/styles";

export const NomResourceLink = ({ navIdent, tekst, title }: { navIdent: string; tekst?: string; title?: string }) => {
  return (
    <Link
      className={linkWithUnderline}
      href={env.isDev ? `https://nom.ekstern.dev.nav.no/ressurs/${navIdent}` : `https://nom.nav.no/ressurs/${navIdent}`}
      inlineText
      rel="noopener noreferrer"
      target="_blank"
      title={title}
    >
      {tekst ?? navIdent}
      <ExternalLinkIcon />
    </Link>
  );
};
