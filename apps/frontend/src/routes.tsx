import * as React from "react";
import {Redirect, Route, Switch} from "react-router-dom";

import Root from "./components/Root";
import ProductAreaListPage from './pages/ProductAreaListPage'
import ProductAreaPage from './pages/ProductAreaPage'
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
import {NotificationPage} from './services/Notifications'
import {MailLogPage} from './components/admin/maillog/MailLogPage'
import ClusterPage from './pages/ClusterPage'
import ClusterListPage from './pages/ClusterListPage'
import {Treemap} from './components/graph/TreeMap'
import {OrgMainPage} from "./pages/OrgMainPage";

const Routes = (): JSX.Element => (
  <Root>
    <Switch>
      <Route exact path="/" component={MainPage}/>

      <Route exact path="/area" component={ProductAreaListPage}/>
      <Route exact path="/area/:id" component={ProductAreaPage}/>

      {/*deprecate*/}
      <Route exact path="/productarea"><Redirect to='/area'/></Route>
      <Redirect exact from='/productarea/:id' to='/area/:id'/>

      <Route exact path="/cluster" component={ClusterListPage}/>
      <Route exact path="/cluster/:id" component={ClusterPage}/>

      <Route exact path="/team" component={TeamListPage}/>
      <Route exact path="/team/:id" component={TeamPage}/>

      <Route exact path="/resource/:id" component={ResourcePage}/>

      <Route exact path="/tag/:id" component={TagPage}/>
      <Route exact path="/location/:floorId?" component={LocationPage}/>

      <Route exact path="/dashboard" component={DashboardPage}/>
      <Route exact path="/dashboard/teams/:filter/:filterValue" component={DashboardPage}/>
      <Route exact path="/dashboard/members/:filter/:filterValue?" component={DashboardPage}/>

      <Route exact path="/admin/audit/:id?/:auditId?" component={AuditPage}/>
      <Route exact path="/admin/maillog" component={MailLogPage}/>
      <Route exact path="/admin/settings" component={SettingsPage}/>

      <Route exact path={"/user/notifications"} component={NotificationPage}/>

      <Route exact path={"/tree"} component={Treemap}/>

      <Route exact path={"/org/:id?"} component={OrgMainPage}/>

      <Route component={NotFound}/>
    </Switch>
  </Root>
)

export default Routes
