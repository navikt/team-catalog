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

type DescriptionSectionProps = {
  header: String
  text: React.ReactNode
}

const DescriptionSection = (props: DescriptionSectionProps) => {
  const { header, text } = props

  return (
    <div>
      <Heading
        size='medium'
        className={css`
          font-size: 22px;
          font-weight: 600;
        `}
      >
        {header}
      </Heading>
      <Divider />
      <BodyShort>{text}</BodyShort>
    </div>
  )
}

export default DescriptionSection
