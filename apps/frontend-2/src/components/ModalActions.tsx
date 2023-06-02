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
  margin-top: var(--a-spacing-5);
  display: flex;
  gap: var(--a-spacing-4);
  flex-wrap: wrap;

  button {
    flex: 1;
  }
`;
