import { css } from "@emotion/css";
import { Heading } from "@navikt/ds-react";
import type { ReactNode } from "react";

import { SmallDivider } from "../Divider";

type DescriptionSectionProperties = {
  header: string;
  text: ReactNode;
};

const DescriptionSection = (properties: DescriptionSectionProperties) => {
  const { header, text } = properties;

  return (
    <div>
      <Heading level="2" size="medium">
        {header}
      </Heading>
      <SmallDivider />
      <div
        className={css`
          margin-top: var(--navds-spacing-4);
        `}
      >
        {text}
      </div>
    </div>
  );
};

export default DescriptionSection;
