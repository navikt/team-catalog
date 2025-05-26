import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { Link } from "@navikt/ds-react";

import { env } from "../util/env";
import { linkWithUnderline } from "../util/styles";

export const NomOrgLink = ({ nomId, tekst }: { nomId: string; tekst?: string }) => {
  return (
    <Link
      className={linkWithUnderline}
      href={env.isDev ? `https://nom.ekstern.dev.nav.no/org/${nomId}` : `https://nom.nav.no/org/${nomId}`}
      inlineText
      rel="noopener noreferrer"
      target="_blank"
    >
      {tekst ? tekst : nomId}
      <ExternalLinkIcon />
    </Link>
  );
};
