import * as React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Root from './components/Root'
import MainPage from './pages/MainPage'

const MainRoutes = (): JSX.Element => (
  <Root>
    <Routes>
      <Route path="/" element={<MainPage />} />
    </Routes>
  </Root>
)

export default MainRoutes
