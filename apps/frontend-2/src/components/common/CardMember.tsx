import { css } from '@emotion/css'
import { Heading } from '@navikt/ds-react'
import { Link } from 'react-router-dom'
import { Member } from '../../constants'
import greyBackground from '../../assets/greyBackgroundMember.svg'
import { intl } from '../../util/intl/intl'
import { UserImage } from '../UserImage'

const cardStyles = css`
  height: 153px;
  width: 435px;
  border: 1px solid #005077;
  border-radius: 4px;
  display: grid;
  grid-template-columns: 1fr 0.3fr;
  margin-bottom: 1rem;
`
const headingStyles = css`
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  line-height: 24px;
  color: #005077;
  margin-top: 1rem;
`

const imageDivStyles = css`
  right: 8px;
  top: 30px;
  position: absolute;
  text-align: right;
`

const CardMember = (props: { member: Member }) => (
  <div className={cardStyles}>
    <div
      className={css`
        height: 100%;
        padding-left: 20px;
      `}>
      <Link
        to={`/resource/${props.member.navIdent}`}
        className={css`
          text-decoration: none;
        `}>
        <Heading size='medium' className={headingStyles}>
          {props.member.resource.fullName}
        </Heading>
      </Link>
      <div
        className={css`
          margin-top: 1.1rem;
        `}>
        <div
          className={css`
            margin-bottom: 3px;
          `}>
          Roller
        </div>
        <div
          className={css`
            font-size: 16px;
          `}>
          <b>{props.member.roles.map((r) => intl[r]).join(', ')}</b>
        </div>
      </div>
    </div>

    <div
      className={css`
        position: relative;
      `}>
      <img
        src={greyBackground}
        className={css`
          z-index: -1;
        `}
      />
      <div className={imageDivStyles}>
        <UserImage ident={props.member.navIdent} size='100px' />
      </div>
    </div>
  </div>
)

export default CardMember
