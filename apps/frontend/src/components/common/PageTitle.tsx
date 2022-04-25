import * as React from 'react'
import { HeadingMedium } from 'baseui/typography'
import { theme } from '../../util/theme'

type PageTitleProps = {
  title: string
  marginBottom?: string
}
const PageTitle = (props: PageTitleProps) => (
  <>
    {props.marginBottom ? (
      <HeadingMedium marginTop={theme.sizing.scale600} marginBottom={props.marginBottom}>
        {props.title}
      </HeadingMedium>
    ) : (
      <HeadingMedium marginTop={theme.sizing.scale600}>{props.title}</HeadingMedium>
    )}
  </>
)

export default PageTitle
