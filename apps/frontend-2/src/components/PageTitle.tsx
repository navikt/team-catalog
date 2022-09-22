import { css } from "@emotion/css"
import { Heading } from "@navikt/ds-react"

type PageTitleProps = {
  title: string
  marginBottom?: string
}
const PageTitle = (props: PageTitleProps) => (
  <>
    {props.marginBottom ? (
      <Heading size="large" className={css`margin-bottom: ${props.marginBottom};`}>{props.title}</Heading>
    ) : (
      <Heading size="large" className={css`margin-top: 16px;`}>{props.title}</Heading>
    )}
  </>
)

export default PageTitle