import * as React from "react";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router-dom";

import Root from "./components/Root";
import ProductAreaListPage from './pages/ProductAreaListPage'
import ProductAreaView from './pages/ProductAreaPage'
import TeamListPage from './pages/TeamListPage'
import TeamPage from './pages/TeamPage'
import MainPage from "./pages/MainPage";
import { AuditPage } from './components/admin/audit/AuditPage'
import { SettingsPage } from './components/admin/settings/SettingsPage'
import { Block } from 'baseui/block'
import { theme } from './util'
import { Paragraph1 } from 'baseui/typography'
import { intl } from './util/intl/intl'
import notFound from "./resources/notfound.svg"
import ResourcePage from "./pages/ResourcePage";

const Routes = (): JSX.Element => (
  <Root>
    <Switch>
      <Route exact path="/" component={MainPage}/>
      <Route exact path="/productarea" component={ProductAreaListPage}/>
      <Route exact path="/productarea/:id" component={ProductAreaView}/>

      <Route exact path="/team" component={TeamListPage}/>
      <Route exact path="/team/:id" component={TeamPage}/>

      <Route exact path="/resource/:id" component={ResourcePage}/>

      <Route exact path="/admin/audit/:id?/:auditId?" component={AuditPage}/>
      <Route exact path="/admin/settings" component={SettingsPage}/>

      <Route component={withRouter(NotFound)}/>
    </Switch>
  </Root>
)

const NotFound = (props: RouteComponentProps<any>) => (
  <Block display="flex" justifyContent="center" alignContent="center" marginTop={theme.sizing.scale4800}>
    <Paragraph1>{intl.pageNotFound} - {props.location.pathname}</Paragraph1>
    <img src={notFound} alt={intl.pageNotFound} style={{maxWidth: "65%"}}/>
  </Block>
)

export default Routes
