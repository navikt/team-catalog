import { css } from "@emotion/css";
import { Button } from "@navikt/ds-react";

export function BetaOffButton() {
  return (
    <Button
      className={css`
        position: absolute;
        bottom: 0;
        margin: var(--navds-spacing-4);
      `}
      onClick={() => (window.location.href = `${window.location.origin}/beta-off`)}
      variant="secondary"
    >
      Gå til gammel løsning
    </Button>
  );
}
