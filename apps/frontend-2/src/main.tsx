import "@navikt/ds-css";
import "@navikt/ds-css-internal";

import { ApolloProvider } from "@apollo/client";
import { css } from "@emotion/css";
import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";

import { apolloClient } from "./api/nom/apolloclient";
import Header from "./components/Header";
import MainRoutes from "./routes";
import { user } from "./services/User";
import { useAwait } from "./util/hooks";

const styling = {
  container: css`
    height: 100%;
  `,
  headerDiv: css`
    width: 100%;
    margin-bottom: 50px;
    @media only screen and (max-width: 768px) {
      margin-left: 5px;
      width: 100%;
    }
  `,
  mainContent: css`
    height: 100%;
    width: 75%;
    margin-left: ${190 + 40}px;
    margin-top: 4px;
    @media only screen and (max-width: 768px) {
      margin-left: 5px;
      width: 100%;
    }
  `,
};

const queryClient = new QueryClient();

const Main = () => {
  useAwait(user.wait());

  if (!user.isLoaded()) return <></>;

  return (
    <React.StrictMode>
      <BrowserRouter>
        <ApolloProvider client={apolloClient}>
          <QueryClientProvider client={queryClient}>
            <div className={styling.container}>
              <div
                className={css`
                  width: 100%;
                `}
              >
                <div className={styling.headerDiv}>
                  <Header />
                </div>

                <div className={styling.mainContent}>
                  <MainRoutes />
                </div>
              </div>
            </div>
          </QueryClientProvider>
        </ApolloProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};

const container = document.querySelector("#root");
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

root.render(<Main />);
