import { css } from '@emotion/css'
import { BodyShort, Heading } from '@navikt/ds-react'
import { Link } from 'react-router-dom'
import { ProductArea } from '../../constants'
import { intl } from '../../util/intl/intl'
import { TextWithLabel } from '../TextWithLabel'
import slackIcon from '../../assets/slackIcon.svg'
import { SlackLink } from '../SlackLink'

interface ShortAreaSummaryProps {
  productArea: ProductArea
}

const Divider = () => (
  <div
    className={css`
      height: 5px;
      background: #005077;
      margin-bottom: 3px;
      margin-top: 0.5rem;
    `}
  ></div>
)

const DisplayTags = (props: { tags: string[] }) => {
  if (props.tags.length <= 0) return <BodyShort>Ingen tags</BodyShort>
  return (
    <div
      className={css`
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      `}
    >
      {props.tags.map((t: string, i: number) => (
        <Link to={'/tag/' + t}>
          {t} {i + 1 < props.tags.length ? ', ' : ''}
        </Link>
      ))}
    </div>
  )
}

const ShortAreaSummarySection = (props: ShortAreaSummaryProps) => {
  const { productArea } = props
  return (
    <div>
      <Heading
        size='medium'
        className={css`
          font-size: 22px;
          font-weight: 600;
        `}
      >
        {' '}
        Kort fortalt
      </Heading>
      <Divider />
      <div
        className={css`
          display: grid;
          grid-template-columns: 1fr;
        `}
      >
        {' '}
        <TextWithLabel
          label={'Områdetype'}
          text={
            productArea.areaType
              ? intl.getString(productArea.areaType + '_AREATYPE_DESCRIPTION')
              : intl.dataIsMissing
          }
        />
        <TextWithLabel
          label='Tagg'
          text={<DisplayTags tags={productArea.tags} />}
          marginTop='2rem'
        />
        <div
          className={css`
            display: flex;
            margin-bottom: 1rem;
          `}
        >
          <div
            className={css`
              align-self: center;
              margin-right: 1rem;
              margin-top: 0.8rem;
            `}
          >
            {' '}
            <img src={slackIcon} alt='Slack kanal' />
          </div>
          <TextWithLabel
            label='Slack'
            text={
              !productArea.slackChannel ? (
                'Fant ikke slack kanal'
              ) : (
                <SlackLink channel={productArea.slackChannel} />
              )
            }
          />
        </div>
      </div>
    </div>
  )
}

export default ShortAreaSummarySection
