import { css } from "@emotion/css";
import { Label } from "@navikt/ds-react";

import { Status } from "../constants";
import { intl } from "../util/intl/intl";

const getStyling = (status: Status) => {
  let backgroundColor = "#FFFFFF";
  let borderColor = "#007C2E";

  if (status === Status.PLANNED) {
    backgroundColor = "#E0D8E9";
    borderColor = "#634689";
  } else if (status === Status.INACTIVE) {
    backgroundColor = "#F9D2CC";
    borderColor = "#BA3A26";
  }

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
    dot: css`
      width: 10px;
      height: 10px;
      background-color: ${borderColor};
      margin-right: 5px;
      border-radius: 5px;
    `,
  };
};

type StatusProperties = {
  status: Status;
};

export const StatusField = (properties: StatusProperties) => {
  return (
    <div className={getStyling(properties.status).div}>
      <div className={getStyling(properties.status).dot}></div>
      <Label
        className={css`
          font-weight: 700;
          font-size: 16px;
        `}
        size="medium"
      >
        {intl[properties.status]}
      </Label>
    </div>
  );
};
