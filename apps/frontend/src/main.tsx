import "@navikt/ds-css";
import "./designSystemOverrides.css";
import "./appStyles.css";

import { getWebInstrumentations, initializeFaro } from "@grafana/faro-web-sdk";
import { TracingInstrumentation } from "@grafana/faro-web-tracing";
import axios from "axios";
import dayjs from "dayjs";
import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./App";
import { env } from "./util/env";

dayjs.locale("nb");

/**
 * Intercept errors that are 401.
 * This assumes that Wonderwall is the service giving 401 errors when there is no active session.
 * Requests are in those cases short-circuited by Wonderwall. https://docs.nais.io/security/auth/wonderwall/?h=wonderwa#11-redirect-after-login
 * When Wonderwall respons with 401 it also supplies a location header that will take the user to login page and be redirected to where they were: /oauth2/login?redirect=${currentPath}
 *
 * To make this work there are a few caveats:
 * 1. autologin must be enabled
 * 2. All requests to Frackend must be ignored by autologin
 * 3. Except the route that serves the SPA. In our case this is the fallback "*" route.
 *
 * See this thread for additional context: https://nav-it.slack.com/archives/C5KUST8N6/p1694767530593689
 */
axios.interceptors.response.use(undefined, (error) => {
  if (error.response.status === 401) {
    window.location.assign(error.response.headers.location);
  }
  return Promise.reject(error);
});

// Don't initialize faro when running the dev-server
if (!env.isLocal) {
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
