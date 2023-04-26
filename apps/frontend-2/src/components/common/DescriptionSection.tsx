import type { ReactNode } from "react";

import { ResourceInfoContainer } from "./ResourceInfoContainer";

type DescriptionSectionProperties = {
  header: string;
  text: ReactNode;
};

export const DescriptionSection = (properties: DescriptionSectionProperties) => {
  const { header, text } = properties;

  return <ResourceInfoContainer title={header}>{text}</ResourceInfoContainer>;
};
