

import { css } from "@emotion/css"
import { Link } from "react-router-dom"
import { ProductArea } from "../../constants"
import { BodyShort, Heading } from '@navikt/ds-react'
import teamCardBackground from '../../assets/teamCardBackground.svg'
import areaCardImage from '../../assets/areaCardImage.svg'
import { intl } from "../../util/intl/intl"

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

const CardArea = (props: {area: ProductArea, navIdent: string}) => {
    const {area, navIdent} = props

    return (
        <div className={cardStyles}>
            <div className={css`height: 100%; padding-left: 20px;`}>
                <Link to={`/resource/${props.area.id}`} className={css`text-decoration: none;`}>
                    <Heading size="medium" className={headingStyles}>{props.area.name}</Heading>
                </Link>

                <div className={css` margin-top: 1.1rem; display: flex;`}>
                    <BodyShort className={css`margin-bottom: 3px; margin-right: 0.5rem;`}>Roller: </BodyShort>
                    <BodyShort className={css`font-size: 16px;`}><b>{props.area.members.find((am) => am.navIdent === props.navIdent)?.roles.map((r: TeamRole) => intl[r]).join(', ')}</b></BodyShort>
                </div>
            </div>

            <div className={css`position: relative; `}>
                <img src={teamCardBackground} className={css`z-index: -1; min-height: 132px; `} />
                <div className={imageDivStyles}><img src={areaCardImage}  /></div>       
            </div>   
        </div>
    )
}

export default CardArea