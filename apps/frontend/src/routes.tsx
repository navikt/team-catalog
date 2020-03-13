import * as React from "react";
import { Route, Switch } from "react-router-dom";

import Root from "./components/Root";
import MainPage from './pages/MainPage'
import ProductAreaLandingPage from './pages/ProductAreaLandingPage'

const Routes = (): JSX.Element => (
  <Root>
    <Switch>
      <Route exact path="/" component={MainPage}/>
      <Route exact path="/productarea" component={ProductAreaLandingPage}/>
    </Switch>
  </Root>
)

export default Routes
