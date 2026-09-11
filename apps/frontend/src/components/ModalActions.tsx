import { css } from "@emotion/css";
import { Button } from "@navikt/ds-react";

export function ModalActions({ isLoading, onClose }: { isLoading: boolean; onClose: () => void }) {
  return (
    <div className={modalActionsStyle}>
      <Button loading={isLoading} type="submit">
        Lagre
      </Button>
      <Button onClick={onClose} type="button" variant="secondary">
        Avbryt
      </Button>
    </div>
  );
}

export const modalActionsStyle = css`
  margin-top: var(--ax-space-20);
  display: flex;
  gap: var(--ax-space-16);
  flex-wrap: wrap;

  button {
    flex: 1;
  }
`;
