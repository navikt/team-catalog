import { css } from "@emotion/css";
import { Link } from "react-router-dom";

import User from "../../assets/person.svg";

export function NumberOfPeopleInResource({
  numberOfPeople,
  numberOfExternals,
  resourceNoun,
  url,
}: {
  numberOfPeople: number;
  numberOfExternals: number;
  resourceNoun: string;
  url: string;
}) {
  return (
    <div
      className={css`
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 2rem;
        
      `}
    >
      <img
        alt=""
        className={css`
          width: 48px;
          height: 48px;
          color: var(--a-deepblue-500);
        `}
        src={User}
      />
      <Link to={url}>
        {numberOfPeople} personer i {resourceNoun}
      </Link>
      <span>{Math.round((numberOfExternals / (numberOfPeople || 1)) * 100)}% eksterne</span>
    </div>
  );
}
