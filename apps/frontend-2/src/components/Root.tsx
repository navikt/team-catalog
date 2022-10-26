import * as React from 'react'
import { Helmet } from 'react-helmet'

import { user } from '../services/User'
import { useAwait } from '../util/hooks'

interface RootProperties {
  children: JSX.Element | Array<JSX.Element>
}

const Root = ({ children }: RootProperties): JSX.Element => {
  return (
    <div>
      <Helmet>
        <meta charSet='utf-8' />
        <title>Teamkatalogen</title>
      </Helmet>
      {children}
    </div>
  )
}

export default Root
