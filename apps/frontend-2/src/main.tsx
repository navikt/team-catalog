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
  headerDiv: css`
    width: 75%;
    margin-left: ${190 + 40}px;
    margin-bottom: 50px;
    @media only screen and (max-width: 768px) {
        margin-left: 5px;
        width: 100%;
    }
  `,
  mainContent: css`
    height: 100%;
    width: 75%;
    margin-left: ${190 + 40}px;
    margin-top: 4px;
    @media only screen and (max-width: 768px) {
        margin-left: 5px;
        width: 100%;
    }
  `
  
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
          <div className={styling.headerDiv}>
              Kommer header her..
          </div>

          <div className={styling.mainContent}>
            <MainRoutes />
          </div>
        </div>
      </div>
      {/* <Footer /> */}
    </ApolloProvider>
  </BrowserRouter>
</React.StrictMode>)