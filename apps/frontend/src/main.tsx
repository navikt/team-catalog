import "@navikt/ds-css";
import "./designSystemOverrides.css";
import "./appStyles.css";

import { getWebInstrumentations, initializeFaro } from "@grafana/faro-web-sdk";
import { TracingInstrumentation } from "@grafana/faro-web-tracing";
import dayjs from "dayjs";
import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./App";
import { env } from "./util/env";

dayjs.locale("nb");

// Don't initialize faro when running the dev-server
if (process.env.NODE_ENV === "production") {
  const url = env.isDev ? "https://telemetry.ekstern.dev.nav.no/collect" : "https://telemetry.nav.no/collect";

  initializeFaro({
    url,
    app: {
      name: "team-catalog ui",
    },
    instrumentations: [...getWebInstrumentations(), new TracingInstrumentation()],
  });
}

ReactDOM.createRoot(document.querySelector("#root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
