import { css } from "@emotion/css";

import User from "../../assets/person.svg";

export function NumberOfPeopleInResource({
  numberOfPeople,
  numberOfExternals,
  resourceNoun,
}: {
  numberOfPeople: number;
  numberOfExternals: number;
  resourceNoun: string;
}) {
  return (
    <div
      className={css`
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin: 1.5rem 0;
      `}
    >
      <img
        alt="menneskeikon"
        className={css`
          width: 48px;
          height: 48px;
          color: var(--navds-global-color-deepblue-500);
        `}
        src={User}
      />
      <b>
        {numberOfPeople} personer i {resourceNoun}
      </b>
      <span>{Math.round((numberOfExternals / (numberOfPeople || 1)) * 100)}% eksterne</span>
    </div>
  );
}
