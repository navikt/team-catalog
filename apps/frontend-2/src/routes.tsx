import * as React from "react";
import { Route, Routes } from "react-router-dom";

import Root from "./components/Root";
import ProductAreaListPage from "./pages/area/ProductAreaListPage";
import ProductAreaPage from "./pages/area/ProductAreaPage";
import ClusterListPage from "./pages/cluster/ClusterListPage";
import ClusterPage from "./pages/cluster/ClusterPage";
import MainPage from "./pages/MainPage";
import ResourcePage from "./pages/ResourcePage";
import TeamListPage from "./pages/team/TeamListPage";
import TeamPage from "./pages/team/TeamPage";

const MainRoutes = (): JSX.Element => (
  <Root>
    <Routes>
      <Route element={<MainPage />} path="/" />

      <Route element={<TeamListPage />} path="/team" />
      <Route element={<TeamPage />} path="/team/:id" />

      <Route element={<ProductAreaListPage />} path="/area" />
      <Route element={<ProductAreaPage />} path="/area/:id" />

      <Route element={<ClusterListPage />} path="/cluster" />
      <Route element={<ClusterPage />} path="/cluster/:id" />

      <Route element={<ResourcePage />} path="/resource/:id" />
    </Routes>
  </Root>
);

export default MainRoutes;
