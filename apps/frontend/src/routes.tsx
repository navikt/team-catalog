import * as React from "react";
import {Route, Switch} from "react-router-dom";

import Root from "./components/Root";
import ProductAreaListPage from './pages/ProductAreaListPage'
import ProductAreaView from './pages/ProductAreaPage'
import TeamListPage from './pages/TeamListPage'
import TeamPage from './pages/TeamPage'
import MainPage from "./pages/MainPage";
import {AuditPage} from './components/admin/audit/AuditPage'
import {SettingsPage} from './components/admin/settings/SettingsPage'
import ResourcePage from "./pages/ResourcePage";
import {DashboardPage} from './components/dash/Dashboard'
import NotFound from "./components/common/NotFound";
import TagPage from "./pages/TagPage";
import {LocationPage} from './pages/LocationPage'

const Routes = (): JSX.Element => (
  <Root>
    <Switch>
      <Route exact path="/" component={MainPage}/>
      <Route exact path="/productarea" component={ProductAreaListPage}/>
      <Route exact path="/productarea/:id" component={ProductAreaView}/>

      <Route exact path="/team" component={TeamListPage}/>
      <Route exact path="/team/:id" component={TeamPage}/>

      <Route exact path="/resource/:id" component={ResourcePage}/>

      <Route exact path="/tag/:id" component={TagPage}/>
      <Route exact path="/location/:floorId?" component={LocationPage}/>

      <Route exact path="/dashboard" component={DashboardPage}/>
      <Route exact path="/dashboard/teams/:filter/:filterValue" component={DashboardPage}/>
      <Route exact path="/dashboard/members/:filter/:filterValue?" component={DashboardPage}/>

      <Route exact path="/admin/audit/:id?/:auditId?" component={AuditPage}/>
      <Route exact path="/admin/settings" component={SettingsPage}/>

      <Route component={NotFound}/>
    </Switch>
  </Root>
)

export default Routes
