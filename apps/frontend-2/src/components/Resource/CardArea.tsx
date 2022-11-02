import { css } from '@emotion/css'
import { BodyShort, Heading } from '@navikt/ds-react'
import { Link } from 'react-router-dom'

import areaCardImage from '../../assets/areaCardImage.svg'
import teamCardBackground from '../../assets/teamCardBackground.svg'
import type { ProductArea, TeamRole } from '../../constants'
import { intl } from '../../util/intl/intl'

const cardStyles = css`
  height: 135px;
  width: 100%;
  border: 1px solid #005077;
  border-radius: 4px;
  display: grid;
  grid-template-columns: 1fr 0.3fr;
  margin-bottom: 1rem;
`
const headingStyles = css`
  font-weight: 600;
  font-size: 22px;
  line-height: 24px;
  color: #005077;
  margin-top: 1rem;
`
const imageDivStyles = css`
  right: 12px;
  top: 35px;
  position: absolute;
  text-align: right;
`

const CardArea = (properties: { area: ProductArea; navIdent: string }) => {

  return (
    <div className={cardStyles}>
      <div
        className={css`
          height: 100%;
          padding-left: 20px;
        `}>
        <Link
          className={css`
            text-decoration: none;
          `}
          to={`/resource/${properties.area.id}`}>
          <Heading className={headingStyles} size='medium'>
            {properties.area.name}
          </Heading>
        </Link>

        <div
          className={css`
            margin-top: 1.1rem;
            display: flex;
          `}>
          <BodyShort
            className={css`
              margin-bottom: 3px;
              margin-right: 0.5rem;
            `}>
            Roller:{' '}
          </BodyShort>
          <BodyShort
            className={css`
              font-size: 16px;
            `}>
            <b>
              {properties.area.members
                .find((am) => am.navIdent === properties.navIdent)
                ?.roles.map((r: TeamRole) => intl[r])
                .join(', ')}
            </b>
          </BodyShort>
        </div>
      </div>

      <div
        className={css`
          position: relative;
        `}>
        <img
          className={css`
            z-index: -1;
            min-height: 132px;
          `}
          src={teamCardBackground}
        />
        <div className={imageDivStyles}>
          <img src={areaCardImage} />
        </div>
      </div>
    </div>
  )
}

export default CardArea
