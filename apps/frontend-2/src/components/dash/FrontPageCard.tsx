import { css } from "@emotion/css";

const FrontPageCard = (properties: {
  title: string;
  icon: string;
  hoverIcon: string;
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
        :hover {
          background-color: #e6f1f8;
        }
      `}
      onMouseLeave={() => {
        // eslint-disable-next-line unicorn/prefer-query-selector
        (document.getElementById("img" + properties.title) as HTMLImageElement).src = properties.icon;
      }}
      onMouseOver={() => {
        // eslint-disable-next-line unicorn/prefer-query-selector
        (document.getElementById("img" + properties.title) as HTMLImageElement).src = properties.hoverIcon;
      }}
    >
      <img
        alt={""}
        className={css`
          margin-top: 2rem;
        `}
        id={"img" + properties.title}
        src={properties.icon}
      />
      <p
        className={css`
          font-size: 50px;
          font-weight: bold;
          margin-bottom: 0;
          margin-top: 1rem;
        `}
      >
        {properties.primaryNumber}
      </p>
      <h2
        className={css`
          margin-top: 0;
          margin-bottom: 0.3rem;
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
