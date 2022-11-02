import { css } from "@emotion/css"
import { Heading } from "@navikt/ds-react"

type PageTitleProperties = {
  title: string
  marginBottom?: string
}
const PageTitle = (properties: PageTitleProperties) => (
  <>
    {properties.marginBottom ? (
      <Heading className={css`margin-bottom: ${properties.marginBottom};`} size="large">{properties.title}</Heading>
    ) : (
      <Heading className={css`margin-top: 16px;`} size="large">{properties.title}</Heading>
    )}
  </>
)

export default PageTitle