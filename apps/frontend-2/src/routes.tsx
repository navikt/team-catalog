import * as React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Root from './components/Root'
import ProductAreaPage from './pages/area/ProductAreaPage'
import MainPage from './pages/MainPage'
import TeamListPage from './pages/team/TeamListPage'
import TeamPage from './pages/team/TeamPage'

const MainRoutes = (): JSX.Element => (
  <Root>
    <Routes>
      <Route path='/' element={<MainPage />} />
      <Route path='/team' element={<TeamListPage />} />
      <Route path='/team/:id' element={<TeamPage />} />

      <Route path='/area/:id' element={<ProductAreaPage />} />
    </Routes>
  </Root>
)

export default MainRoutes
