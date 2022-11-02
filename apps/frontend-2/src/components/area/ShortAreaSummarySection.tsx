import { css } from '@emotion/css'
import { BodyShort, Heading } from '@navikt/ds-react'
import { Link } from 'react-router-dom'

import type { ProductArea } from '../../constants'
import { intl } from '../../util/intl/intl'
import { SlackLink } from '../SlackLink'
import { TextWithLabel } from '../TextWithLabel'

interface ShortAreaSummaryProperties {
  productArea: ProductArea
}

const Divider = () => (
  <div
    className={css`
      height: 5px;
      background: #005077;
      margin-bottom: 3px;
      margin-top: 0.5rem;
    `}></div>
)

const DisplayTags = (properties: { tags: string[] }) => {
  if (properties.tags.length <= 0) return <BodyShort>Ingen tags</BodyShort>
  return (
    <div
      className={css`
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      `}>
      {properties.tags.map((t: string, index: number) => (
        <Link key={t} to={'/tag/' + t}>
          {t} {index + 1 < properties.tags.length ? ', ' : ''}
        </Link>
      ))}
    </div>
  )
}

const ShortAreaSummarySection = (properties: ShortAreaSummaryProperties) => {
  const { productArea } = properties
  return (
    <div>
      <Heading
        className={css`
          font-size: 22px;
          font-weight: 600;
        `}
        size='medium'>
        Kort fortalt
      </Heading>
      <Divider />
      <div
        className={css`
          display: grid;
          grid-template-columns: 1fr;
        `}>
        <TextWithLabel
          label={'Områdetype'}
          text={productArea.areaType ? intl.getString(productArea.areaType + '_AREATYPE_DESCRIPTION') : intl.dataIsMissing}
        />
        <TextWithLabel label='Tagg' marginTop='2rem' text={<DisplayTags tags={productArea.tags} />} />
        <div
          className={css`
            display: flex;
            margin-bottom: 1rem;
          `}>
          <div
            className={css`
              align-self: center;
              margin-top: 0.8rem;
            `}>
            {' '}
          </div>
          <TextWithLabel
            label='Slack'
            marginTop='2rem'
            text={!productArea.slackChannel ? 'Fant ikke slack kanal' : <SlackLink channel={productArea.slackChannel} />}
          />
        </div>
      </div>
    </div>
  )
}

export default ShortAreaSummarySection
