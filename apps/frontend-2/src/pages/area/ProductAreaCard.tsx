import { css } from "@emotion/css";
import { Label } from "@navikt/ds-react";
import { ProductAreaSummary2 } from "../../components/dash/Dashboard";
import teamCardIconCircle from "../../assets/teamCardIconCircle.svg";
import teamCardResourceCircle from "../../assets/teamCardResourceCircle.svg";
import { NavigateFunction } from "react-router-dom";

export type cardInterface = {
  name: string;
  id: string;
  paInfo?: ProductAreaSummary2;
};

const cardStyle = css`
  border: 1px solid #005077;
  border-radius: 5px;
  margin-bottom: 1rem;
  width: 48%;
  height: 100px;
  overflow: hidden;
  :hover {
    cursor: pointer;
  }
`;
// href={"/area/" + pa.id

const ProductAreaCard = (pa: cardInterface, color: string, navigate: NavigateFunction) => {
  console.log({ pa });
  return (
    <div className={cardStyle} onClick={(event) => navigate("/area/" + pa.id, { state: { name: pa.id } })}>
      <div
        className={css`
          display: flex;
          width: 100%;
          height: 50%;
          align-items: center;
          padding-left: 1rem;
          color: #005077;
        `}
      >
        <h3>{pa.name}</h3>
      </div>
      <div
        className={css`
          display: flex;
          width: 100%;
          height: 50%;
          background-color: ${color};
          align-items: center;
          padding-left: 1rem;
        `}
      >
        <div
          className={css`
            display: flex;
            width: 100%;
          `}
        >
          <img
            className={css`
              margin-right: 0.3rem;
            `}
            src={teamCardIconCircle}
            width="30px"
          />
          <Label
            className={css`
              margin-right: 1.5rem;
            `}
          >
            {pa.paInfo?.totalTeamCount || 0} team
          </Label>

          <img
            className={css`
              margin-right: 0.3rem;
            `}
            src={teamCardResourceCircle}
            width="30px"
          />

          <Label>{pa.paInfo?.uniqueResourcesCount || 0} personer</Label>
        </div>
      </div>
    </div>
  );
};

export default ProductAreaCard;
