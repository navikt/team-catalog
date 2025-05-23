import { Link } from "react-router-dom";

import { env } from "../util/env";
import { linkWithUnderline } from "../util/styles";

export const NomOrgLink = ({ nomId, tekst }: { nomId: string; tekst: string | undefined }) => {
  return (
    <Link
      className={linkWithUnderline}
      rel="noopener noreferrer"
      target="_blank"
      to={env.isDev ? `https://nom.ekstern.dev.nav.no/org/${nomId}` : `https://nom.nav.no/org/${nomId}`}
    >
      {tekst ? tekst : nomId}
    </Link>
  );
};
