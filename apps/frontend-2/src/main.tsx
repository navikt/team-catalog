import React from 'react'
import {createRoot} from 'react-dom/client'
import '@navikt/ds-css'
import '@navikt/ds-css-internal'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import { apolloClient } from './api/nom/apolloclient'
import MainRoutes from './routes'
import { css } from '@emotion/css'
import Sidebar from './components/navigation/Sidebar'

const styling = {
  container: css`
    height: 100%;
  `,
  sidebarDiv: css`
      @media only screen and (max-width: 768px) {
          display: none;
      }
  `,
}

const container = document.getElementById("root")
const root = createRoot(container!);
root.render(<React.StrictMode>
  <BrowserRouter>
    <ApolloProvider client={apolloClient}>
      
      <div className={styling.container}>

        <div className={styling.sidebarDiv}>
            <Sidebar />
        </div>

        <div className={css`width: 100%;`}>
          

          <div>
            <MainRoutes />
          </div>
        </div>
      </div>
      {/* <Footer /> */}
    </ApolloProvider>
  </BrowserRouter>
</React.StrictMode>)