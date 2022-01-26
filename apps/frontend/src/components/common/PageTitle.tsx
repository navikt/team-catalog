import * as React from 'react'
import {H4} from 'baseui/typography'
import {theme} from '../../util/theme'

type PageTitleProps = {
  title: string
  marginBottom?: string
}
const PageTitle = (props: PageTitleProps) => (
  <>
  {props.marginBottom ? <H4 marginTop={theme.sizing.scale600} marginBottom={props.marginBottom}>{props.title}</H4>
                        : <H4 marginTop={theme.sizing.scale600}>{props.title}</H4>              
  }
    
  </>
)

export default PageTitle
