import "@navikt/ds-css";
import "./designSystemOverrides.css";
import "./appStyles.css";

import dayjs from "dayjs";
import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "../App";

dayjs.locale("nb");

ReactDOM.createRoot(document.querySelector("#root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
