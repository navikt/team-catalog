import * as React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Root from './components/Root'
import ProductAreaListPage from './pages/ProductAreaListPage'
import ProductAreaPage from './pages/ProductAreaPage'
import TeamListPage from './pages/TeamListPage'
import TeamPage from './pages/TeamPage'
import MainPage from './pages/MainPage'
import { AuditPage } from './components/admin/audit/AuditPage'
import { SettingsPage } from './components/admin/settings/SettingsPage'
import ResourcePage from './pages/ResourcePage'
import { DashboardPage } from './components/dash/Dashboard'
import NotFound from './components/common/NotFound'
import TagPage from './pages/TagPage'
import { LocationPage } from './pages/LocationPage'
import { NotificationPage } from './services/Notifications'
import { MailLogPage } from './components/admin/maillog/MailLogPage'
import ClusterPage from './pages/ClusterPage'
import ClusterListPage from './pages/ClusterListPage'
import { Treemap } from './components/graph/TreeMap'
import { OrgMainPage } from './pages/OrgMainPage'
import { OrgStartPage } from './pages/OrgStartPage'
import LocationView from './pages/LocationView'
import NomAutogenApiTestPage from "./pages/NomAutogenApiTestPage";

const MainRoutes = (): JSX.Element => (
  <Root>
    <Routes>
      <Route path="/" element={<MainPage/>} />

      <Route path="/area" element={<ProductAreaListPage/>} />
      <Route path="/area/:id" element={<ProductAreaPage/>} />


      {/*deprecate*/}
      <Route path="/productarea" element={<Navigate replace to="/area"/>}/>
      <Route path="/productarea/:id" element={<Navigate replace to=":id" />} />

      <Route path="/cluster" element={<ClusterListPage/>} />
      <Route path="/cluster/:id" element={<ClusterPage/>} />


      <Route path="/team" element={<TeamListPage/>} />
      <Route path="/team/:id" element={<TeamPage/>} />

      <Route path="/resource/:id" element={<ResourcePage/>} />

      <Route path="/tag/:id" element={<TagPage/>} />

      <Route path="/location/" element={<LocationView/>} />
      <Route path="/location/:locationCode" element={<LocationView/>} />

      <Route path="/dashboard" element={<DashboardPage/>} />
      <Route path="/dashboard/teams/:filter/:filterValue" element={<DashboardPage/>} />
      <Route path="/dashboard/members/:filter" element={<DashboardPage/>} />
      <Route path="/dashboard/members/:filter/:filterValue" element={<DashboardPage/>} />

      <Route path="/admin/audit" element={<AuditPage/>} />
      <Route path="/admin/audit/:id" element={<AuditPage/>} />
      <Route path="/admin/audit/:id/:auditId" element={<AuditPage/>} />

      <Route path="/admin/maillog" element={<MailLogPage/>} />
      <Route path="/admin/settings" element={<SettingsPage/>} />

      <Route path={'/user/notifications'} element={<NotificationPage/>} />

      <Route path={'/tree'} element={<Treemap/>} />

      <Route path={'/org'} element={<OrgMainPage/>} />
      <Route path={'/org/:id'} element={<OrgMainPage/>} />
      <Route path={'/orgNav/'} element={<OrgStartPage/>} />

      <Route path={'/nomautogenapitestpage'} element={<NomAutogenApiTestPage/>}/>

      <Route element={<NotFound/>} />
    </Routes>
  </Root>
)

export default MainRoutes
