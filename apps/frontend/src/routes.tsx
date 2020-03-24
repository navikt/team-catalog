import * as React from "react";
import { Route, Switch } from "react-router-dom";

import Root from "./components/Root";
import ProductAreaListPage from './pages/ProductAreaListPage'
import ProductAreaView from './pages/ProductAreaView'
import TeamListPage from './pages/TeamListPage'
import TeamPage from './pages/TeamPage'
import MainPage from "./pages/MainPage";

const Routes = (): JSX.Element => (
  <Root>
    <Switch>
      <Route exact path="/" component={MainPage} />
      <Route exact path="/productarea" component={ProductAreaListPage} />
      <Route exact path="/productarea/:id" component={ProductAreaView} />

      <Route exact path="/team" component={TeamListPage} />
      <Route exact path="/team/:id" component={TeamPage} />
    </Switch>
  </Root>
)

export default Routes
