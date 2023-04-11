import { css } from "@emotion/css";
import { Label } from "@navikt/ds-react";

import type { ResourceType } from "../constants";
import { intl } from "../util/intl/intl";

const getStyling = (resourceType: ResourceType) => {
  const backgroundColor = "#E6F1F8";
  const borderColor = "#005077";

  return {
    div: css`
      background-color: ${backgroundColor};
      width: 110px;
      border: 1px solid ${borderColor};
      border-radius: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 34px;
    `,
  };
};

type ResourceProperties = {
  resourceType: ResourceType;
};

const ResourceField = (properties: ResourceProperties) => {
  return (
    <div className={getStyling(properties.resourceType).div}>
      <Label
        className={css`
          font-weight: 700;
          font-size: 16px;
        `}
        size="medium"
      >
        {intl[properties.resourceType]}
      </Label>
    </div>
  );
};

export default ResourceField;
