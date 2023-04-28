import { Route, Routes } from "react-router-dom";

import { MailLogPage } from "./pages/admin/MailLogPage";
import { ProductAreaListPage } from "./pages/area/ProductAreaListPage";
import { ProductAreaPage } from "./pages/area/ProductAreaPage";
import { ClusterListPage } from "./pages/cluster/ClusterListPage";
import { ClusterPage } from "./pages/cluster/ClusterPage";
import { LocationPage } from "./pages/location/LocationPage";
import { MainPage } from "./pages/MainPage";
import { MembershipsPage } from "./pages/membership/MembershipsPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { ResourcePage } from "./pages/resource/ResourcePage";
import { TagPage } from "./pages/TagPage";
import { TeamFilterPage } from "./pages/team/TeamFilterPage";
import { TeamListPage } from "./pages/team/TeamListPage";
import { TeamPage } from "./pages/team/TeamPage";

export const MainRoutes = () => (
  <Routes>
    <Route element={<MainPage />} path="/" />

    <Route element={<TeamListPage />} path="/team" />
    <Route element={<TeamFilterPage />} path="/teams/filter" />
    <Route element={<TeamPage />} path="/team/:teamId" />

    <Route element={<ProductAreaListPage />} path="/area" />
    <Route element={<ProductAreaPage />} path="/area/:productAreaId" />

    <Route element={<ClusterListPage />} path="/cluster" />
    <Route element={<ClusterPage />} path="/cluster/:clusterId" />

    <Route element={<ResourcePage />} path="/resource/:navIdent" />

    <Route element={<LocationPage />} path="/location/" />
    <Route element={<LocationPage />} path="/location/:locationCode" />

    <Route element={<MembershipsPage />} path="/memberships" />

    <Route element={<NotificationsPage />} path="/user/notifications" />

    <Route element={<TagPage />} path="/tag/:id" />

    <Route element={<MailLogPage />} path="/admin/maillog" />

    <Route element={"Siden finnes ikke eller er ikke enda implementert."} path="*" />
  </Routes>
);
