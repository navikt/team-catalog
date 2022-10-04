import * as React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Root from './components/Root'
import MainPage from './pages/MainPage'
import TeamListPage from './pages/TeamListPage'
import TeamPage from './pages/TeamPage'

const MainRoutes = (): JSX.Element => (
  <Root>
    <Routes>
      <Route path='/' element={<MainPage />} />
      <Route path='/team' element={<TeamListPage />} />
      <Route path='/team/:id' element={<TeamPage />} />
    </Routes>
  </Root>
)

export default MainRoutes
