import { css } from '@emotion/css'
import { BodyShort, Heading } from '@navikt/ds-react'

const Divider = () => (
  <div
    className={css`
      height: 5px;
      background: #005077;
      margin-bottom: 1rem;
      margin-top: 0.5rem;
    `}
  ></div>
)

type DescriptionSectionProperties = {
  header: string
  text: React.ReactNode
}

const DescriptionSection = (properties: DescriptionSectionProperties) => {
  const { header, text } = properties

  return (
    <div>
      <Heading
        className={css`
          font-size: 22px;
          font-weight: 600;
        `}
        size='medium'
      >
        {header}
      </Heading>
      <Divider />
      <BodyShort>{text}</BodyShort>
    </div>
  )
}

export default DescriptionSection
