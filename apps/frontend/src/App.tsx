import { css, cx } from "@emotion/css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router-dom";

import { ExpiryNotifier } from "./components/ExpiryNotifier";
import { Footer, footerHeight } from "./components/Footer";
import { Header } from "./components/Header";
import { JumpToContent } from "./components/JumpToContent";
import { MainRoutes } from "./routes";

const queryClient = new QueryClient();

export function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ExpiryNotifier />
        <ReactQueryDevtools initialIsOpen={false} />
        <AppContent />
      </QueryClientProvider>
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
