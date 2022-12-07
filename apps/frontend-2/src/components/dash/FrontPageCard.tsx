import { css } from "@emotion/css";

import areaCardBlue from "../../assets/areaCardBlue.svg";

const FrontPageCard = (properties: {
  title: string;
  icon: string;
  primaryNumber: number;
  secondaryNumber?: string;
  secondaryText?: string;
  annotation?: string;
}) => {
  return (
    <div
      className={css`
        border: 4px solid #e6f1f8;
        border-radius: 15px;
        width: 300px;
        display: flex;
        flex-direction: column;
        align-items: center;
      `}
    >
      <img
        className={css`
          margin-top: 2rem;
        `}
        src={properties.icon}
      />
      <p
        className={css`
          font-size: 50px;
          font-weight: bold;
          margin-bottom: 1rem;
          margin-top: 1rem;
        `}
      >
        {properties.primaryNumber}
      </p>
      <h2
        className={css`
          margin-top: 0rem;
        `}
      >
        {properties.title}
      </h2>
      {properties.secondaryText && properties.secondaryNumber ? (
        <p>{`${properties.secondaryText}: ${properties.secondaryNumber}${properties.annotation ?? ""}`}</p>
      ) : (
        <></>
      )}
    </div>
  );
};

export default FrontPageCard;
