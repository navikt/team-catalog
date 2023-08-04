import { css } from "@emotion/css";
import { BodyShort } from "@navikt/ds-react";
import dayjs from "dayjs";

import type { ChangeStamp } from "../constants";

export function LastModifiedBy({ changeStamp }: { changeStamp?: ChangeStamp }) {
  if (!changeStamp) {
    return <></>;
  }

  const { lastModifiedDate, lastModifiedBy } = changeStamp;

  return (
    <BodyShort
      className={css`
        text-align: end;
        margin-top: 2rem;
      `}
      size="small"
    >
      <b>Sist endret av: </b>
      <span>{lastModifiedBy.slice(10)}</span> <span>{dayjs(lastModifiedDate).format("DD.MM.YYYY H:mm ")}</span>
    </BodyShort>
  );
}
