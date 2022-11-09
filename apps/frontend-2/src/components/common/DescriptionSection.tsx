import type { ReactNode } from "react";

import { ResourceInfoContainer } from "./ResourceInfoContainer";

type DescriptionSectionProperties = {
  header: string;
  text: ReactNode;
};

const DescriptionSection = (properties: DescriptionSectionProperties) => {
  const { header, text } = properties;

  return <ResourceInfoContainer title={header}>{text}</ResourceInfoContainer>;
};

export default DescriptionSection;
