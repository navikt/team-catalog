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
  headerDiv: css`
    margin-bottom: 50px;
  `,
  mainContent: css`
    display: flex;
    justify-content: center;
    margin: 0 75px;
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
            <Header />
            <div className={styling.mainContent}>
              <div
                className={css`
                  max-width: 1600px;
                `}
              >
                <MainRoutes />
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
