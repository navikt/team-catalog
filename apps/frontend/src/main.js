import * as React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Routes from "./routes";
import { customTheme } from "./util/theme";
import { Provider as StyletronProvider } from "styletron-react";
import { BaseProvider, styled } from "baseui";
import { Client as Styletron } from "styletron-engine-atomic";
import { Block } from "baseui/block";
import SideBar from "./components/SideBar";
import Header from "./components/Header";
import { ampli } from "./services/Amplitude";

const engine = new Styletron();

const sidebarMargin = ["0", "0", `${200 + 60}px`, `${240 + 60}px`]; //Width of sidebar + margin

const MainContent = styled("div", {
  height: "100%",
  width: "80%",
  marginLeft: sidebarMargin,
  marginTop: "4rem",
});

const HeaderContent = styled("div", {
  marginLeft: sidebarMargin,
  width: "80%",
  marginBottom: "50px",
});
const containerProps = {
  height: "100%",
  display: "flex",
};
const headerProps = {
  marginLeft: sidebarMargin,
  width: ["100%", "100%", "75%", "75%"],
  marginBottom: "50px",
};

const mainContentProps = {
  height: "100%",
  width: ["100%", "100%", "75%", "75%"],
  marginLeft: sidebarMargin,
  marginTop: "4rem",
};

ampli.logEvent("visit_count_teamkatalog");

const Main = (props) => {
  const { history } = props;

  return (
    <React.Fragment>
      <StyletronProvider value={engine}>
        <BaseProvider theme={customTheme}>
          <Router history={history}>
            <Block {...containerProps}>
              <Block display={["none", "none", "block", "block"]}>
                <SideBar />
              </Block>

              <Block width="100%">
                <Block {...headerProps}>
                  <Header />
                </Block>
                <Block {...mainContentProps}>
                  <Routes />
                </Block>
              </Block>
            </Block>
          </Router>
        </BaseProvider>
      </StyletronProvider>
    </React.Fragment>
  );
};

export default Main;
