import { ResponsiveBar } from "@nivo/bar";
import React from "react";

type ChartNivoProperties = {
  chartData: { day: string; resources: number }[];
};

const ChartNivo = (properties: ChartNivoProperties) => {
  const { chartData } = properties;
  return (
    <ResponsiveBar
      animate={true}
      axisRight={undefined}
      axisTop={undefined}
      colors="#3182CE"
      data={chartData}
      enableLabel={false}
      indexBy="day"
      keys={["resources"]}
      margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
      padding={0.4}
      valueScale={{ type: "linear" }}
    />
  );
};

export default ChartNivo;
