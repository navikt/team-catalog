import { css } from "@emotion/css"
import { Resource } from "../../constants"
import { BodyShort, Heading } from "@navikt/ds-react"
import { TextWithLabel } from "../TextWithLabel"

import identIcon from '../../assets/identIcon.svg'
import emailIcon from '../../assets/emailIcon.svg'
import fromDateIcon from '../../assets/fromDateIcon.svg'

const Divider = () => (
    <div className={css`height: 5px; background: #005077; margin-bottom: 1rem;  margin-top: 0.5rem;`}></div>
)

const rowStyling = css`
    display: flex;
    margin-bottom: 1rem;
`
const iconDivStyling = css`align-self: center; margin-right: 2rem; margin-top: 0.8rem; height: 80px;`

type AboutUsSectionProps = {
    resource: Resource
}

const ShortSummaryResource = (props: AboutUsSectionProps) => {
    const { resource } = props 

    return (
        <div>
            <Heading size="medium">Kort fortalt</Heading>
            <Divider /> 
            <div className={rowStyling}>
                <div className={iconDivStyling}> <img src={identIcon} alt="Lokasjon" /></div>
                <TextWithLabel label='NAV-ident' text={resource.navIdent} />
            </div>

            <div className={rowStyling}>
                <div className={iconDivStyling}> <img src={emailIcon} alt="E-post" /></div>
                <TextWithLabel label='E-post' text={resource.email} />
            </div>

            <div className={rowStyling}>
                <div className={iconDivStyling}> <img src={fromDateIcon} alt="Startdato" /></div>
                <TextWithLabel label='Startdato' text={resource.startDate} />
            </div>
        </div>
    )
}

export default ShortSummaryResource