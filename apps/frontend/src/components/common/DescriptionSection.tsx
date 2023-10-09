import React from "react";

import { Markdown } from "../Markdown";
import { ResourceInfoContainer } from "./ResourceInfoContainer";

export const DescriptionSection = ({ markdownText }: { markdownText: string }) => {
  return (
    <ResourceInfoContainer title="Om oss">
      <div>
        <Markdown source={markdownText} />
      </div>
    </ResourceInfoContainer>
  );
};
