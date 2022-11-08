import "@navikt/ds-css";
import "@navikt/ds-css-internal";
import "./designSystemOverrides.css";

import { ApolloProvider } from "@apollo/client";
import { css } from "@emotion/css";
import type { ReactNode } from "react";
import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";

import { apolloClient } from "./api/nom/apolloclient";
import Header from "./components/Header";
import MainRoutes from "./routes";
import { user } from "./services/User";
import { useAwait } from "./util/hooks";

const queryClient = new QueryClient();

const Main = () => {
  useAwait(user.wait());

  if (!user.isLoaded()) return <></>;

  return (
    <React.StrictMode>
      <BrowserRouter>
        <ApolloProvider client={apolloClient}>
          <QueryClientProvider client={queryClient}>
            <CenteredContentContainer>
              <Header />
              <MainRoutes />
            </CenteredContentContainer>
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
