import * as React from 'react'
import { useLocation } from 'react-router-dom'
import { Block } from 'baseui/block'
import { theme } from '../../util'
import { ParagraphLarge } from 'baseui/typography'
import { intl } from '../../util/intl/intl'
import notFound from '../../resources/notfound.svg'

const NotFound = () => {
  const location = useLocation()
  return (
    <Block display="flex" justifyContent="center" alignContent="center" marginTop={theme.sizing.scale2400}>
      <ParagraphLarge>
        {intl.pageNotFound} - {location.pathname}
      </ParagraphLarge>
      <img src={notFound} alt={intl.pageNotFound} style={{ maxWidth: '65%' }} />
    </Block>
  )
}

export default NotFound
