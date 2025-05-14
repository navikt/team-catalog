import { Link } from "react-router-dom";

import { env } from "../util/env";
import { linkWithUnderline } from "../util/styles";

export const NomOrgLink = ({ nomId }: { nomId: string }) => {
  return (
    <Link
      className={linkWithUnderline}
      rel="noopener noreferrer"
      target="_blank"
      to={env.isDev ? `https://nom.ekstern.dev.nav.no/org/${nomId}` : `https://nom.nav.no/org/${nomId}`}
    >
      {nomId}
    </Link>
  );
};
