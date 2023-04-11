import { css } from "@emotion/css";

export const linkCardStyle = css`
  cursor: pointer;
  text-decoration: none;

  border-radius: 8px;

  border: 1px solid var(--a-deepblue-600);
  height: 100px;
  flex-direction: column;

  label {
    color: var(--a-gray-900);
  }

  &:hover {
    h2,
    h3 {
      text-decoration: underline;
    }
  }
  &:focus {
    color: var(--a-text-action);
    background: inherit;
  }
`;

// TODO: remove/fix???????
export const linkWithUnderline = css`
  color: #005077;
  font-weight: 600;
  line-height: 20px;
  text-decoration: underline;
`;
