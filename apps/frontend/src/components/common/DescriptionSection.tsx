import { css } from "@emotion/css";
import React from "react";

import { Markdown } from "../Markdown";
import { ResourceInfoContainer } from "./ResourceInfoContainer";

const addSeparationBetweenParagraphsStyle = css`
  p {
    margin-bottom: 1rem;
  }
`;
export const DescriptionSection = ({ markdownText }: { markdownText: string }) => {
  return (
    <ResourceInfoContainer title="Om oss">
      <div className={addSeparationBetweenParagraphsStyle}>
        <Markdown source={markdownText} />
      </div>
    </ResourceInfoContainer>
  );
};
