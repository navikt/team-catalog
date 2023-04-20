import { Route, Routes } from "react-router-dom";

import Root from "./components/Root";
import ProductAreaListPage from "./pages/area/ProductAreaListPage";
import ProductAreaPage from "./pages/area/ProductAreaPage";
import ClusterListPage from "./pages/cluster/ClusterListPage";
import ClusterPage from "./pages/cluster/ClusterPage";
import LocationView from "./pages/LocationView";
import MainPage from "./pages/MainPage";
import ResourcePage from "./pages/resource/ResourcePage";
import { MembershipsPage } from "./pages/table/MembershipsPage";
import TagPage from "./pages/TagPage";
import { TeamFilterPage } from "./pages/team/TeamFilterPage";
import TeamListPage from "./pages/team/TeamListPage";
import TeamPage from "./pages/team/TeamPage";

const MainRoutes = () => (
  <Root>
    <a id={"main-content"} tabIndex={-1}></a>
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

      <Route element={<LocationView />} path="/location/" />
      <Route element={<LocationView />} path="/location/:locationCode" />

      <Route element={<MembershipsPage />} path="/memberships" />

      <Route element={<TagPage />} path="/tag/:id" />

      <Route element={"Siden finnes ikke eller er ikke enda implementert."} path="*" />
    </Routes>
  </Root>
);

export default MainRoutes;
