import { css } from "@emotion/css";
import { useParams } from "react-router-dom";

import type { LocationSummary } from "../../hooks";
import { useDashboard } from "../../hooks";
import { HorizontalBarChart } from "./HorizontalBarChart";

export function OfficeDaysChart() {
  const locationStats = useDashboard();
  const { locationCode } = useParams<{ locationCode?: string }>();

  const data = locationCode ? formatData(locationStats?.locationSummaryMap[locationCode]) : [];
  if (data.length === 0) {
    return <></>;
  }

  return (
    <HorizontalBarChart
      className={css`
        flex: 1;

        @media screen and (min-width: 500px) {
          min-width: 500px;
        }
      `}
      rows={data}
      title="Planlagte kontordager"
    />
  );
}

function formatData(location?: LocationSummary) {
  if (!location) {
    return [];
  }

  return [
    { label: "Mandag", value: location.monday.resourceCount },
    { label: "Tirsdag", value: location.tuesday.resourceCount },
    { label: "Onsdag", value: location.wednesday.resourceCount },
    { label: "Torsdag", value: location.thursday.resourceCount },
    { label: "Fredag", value: location.friday.resourceCount },
  ];
}
