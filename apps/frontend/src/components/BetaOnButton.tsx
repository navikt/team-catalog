import { css } from "@emotion/css";

export function BetaOnButton() {
  return (
    <button
      className={css`
        position: absolute;
        top: 0;
        right: 0;
        margin: 1rem;
      `}
      onClick={() => (window.location.href = `${window.location.origin}/beta-on`)}
    >
      Gå til ny løsning (BETA)
    </button>
  );
}
