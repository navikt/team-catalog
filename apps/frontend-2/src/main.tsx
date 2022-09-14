import React from 'react'
import {createRoot} from 'react-dom/client'
// import '@navikt/ds-css'
// import '@navikt/ds-css-internal'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import { apolloClient } from './api/nom/apolloclient'
import MainRoutes from './routes'


const container = document.getElementById("root")
const root = createRoot(container!);

root.render(<React.StrictMode>
  <BrowserRouter>
    <ApolloProvider client={apolloClient}>
      
      <div>
        <div>
          <MainRoutes />
        </div>
      </div>
      {/* <Footer /> */}
    </ApolloProvider>
  </BrowserRouter>
</React.StrictMode>)