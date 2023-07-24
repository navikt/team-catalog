import { ApolloProvider } from "@apollo/client";
import { css, cx } from "@emotion/css";
import { Modal } from "@navikt/ds-react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";

import { apolloClient } from "./src/api/nom/apolloclient";
import { Footer, footerHeight } from "./src/components/Footer";
import { Header } from "./src/components/Header";
import { JumpToContent } from "./src/components/JumpToContent";
import { MainRoutes } from "./src/routes";

const queryClient = new QueryClient();

export function App() {
  /**
   * Must set where a modal is mounted for screen readers to work properly: https://aksel.nav.no/designsystem/komponenter/modal
   * Not sure if setting it at the root like this is sufficient, or if it should be part of every modal's useEffects()
   */
  if (Modal.setAppElement) {
    Modal.setAppElement(document.querySelector("#root"));
  }

  return (
    <BrowserRouter>
      <ApolloProvider client={apolloClient}>
        <QueryClientProvider client={queryClient}>
          <AppContent />
        </QueryClientProvider>
      </ApolloProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  return (
    <>
      <div
        className={cx(
          "app",
          css`
            min-height: calc(100vh - ${footerHeight});
          `,
        )}
      >
        <JumpToContent id="main-content" />
        <main className="page-margins">
          <Header />
          <a id="main-content" tabIndex={-1} />
          <MainRoutes />
        </main>
      </div>
      <Footer />
    </>
  );
}
