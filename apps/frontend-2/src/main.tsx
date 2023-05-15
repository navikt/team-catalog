import "@navikt/ds-css";
import "@navikt/ds-css-internal";
import "./designSystemOverrides.css";

import { ApolloProvider } from "@apollo/client";
import { css } from "@emotion/css";
import { Modal } from "@navikt/ds-react";
import dayjs from "dayjs";
import type { ReactNode } from "react";
import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";

import { apolloClient } from "./api/nom/apolloclient";
import { Footer, footerHeigth } from "./components/Footer";
import { Header, headerHeigth } from "./components/Header";
import { JumpToContent } from "./components/JumpToContent";
import { MainRoutes } from "./routes";

const queryClient = new QueryClient();
dayjs.locale("nb");



const Main = () => {
  /**
   * Must set where a modal is mounted for screen readers to work properly: https://aksel.nav.no/designsystem/komponenter/modal
   * Not sure if setting it at the root like this is sufficient, or if it should be part of every modal's useEffects()
   */
  if (Modal.setAppElement) {
    Modal.setAppElement(document.querySelector("#root"));
  }

  return (
    <React.StrictMode>
      <BrowserRouter>
        <ApolloProvider client={apolloClient}>
          <QueryClientProvider client={queryClient}>
            <CenteredContentContainer>
              <JumpToContent id="main-content" />
              <Header />
              <a id="main-content" tabIndex={-1} />
              <MainRoutes />
            </CenteredContentContainer>
            <Footer />
          </QueryClientProvider>
        </ApolloProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};

function CenteredContentContainer({ children }: { children: ReactNode }) {
  return (
    <div
      className={css`
        width: 100%;
        display: flex;
        justify-content: center;
        overflow-x: clip;
        /* 100px under er testet frem til, dette hende dette må endres ved endringer på header eller footer */
        min-height: calc(100vh - ${headerHeigth} - ${footerHeigth} + 100px);
      `}
    >
      <div
        className={css`
          width: 1400px;
          margin: 0 75px 75px;
        `}
      >
        {children}
      </div>
    </div>
  );
}

const container = document.querySelector("#root");
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

root.render(<Main />);
