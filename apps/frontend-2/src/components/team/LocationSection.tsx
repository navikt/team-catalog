import { css } from "@emotion/css"
import { BodyShort, Heading } from "@navikt/ds-react"
import { ContactAddress, ProductArea, ProductTeam } from "../../constants"
import { TextWithLabel } from "../TextWithLabel"
import { SlackLink } from "../SlackLink"

import locationIcon from '../../assets/locationIcon.svg'
import officeDaysIcon from '../../assets/officeDaysIcon.svg'
import slackIcon from '../../assets/slackIcon.svg'
import { Link } from "react-router-dom"

const Divider = () => (
    <div className={css`height: 5px; background: #005077; margin-bottom: 5px`}></div>
)

const rowStyling = css`
    display: flex;
    margin-bottom: 1rem;
`
const iconDivStyling = css`align-self: center; margin-right: 1rem; margin-top: 0.8rem;`

const displayOfficeHours = (days: string[], information?: string) => {
    return (
      <div>
        <BodyShort className={css`margin-bottom: 5px; margin-top: 10px;`}>
          {days.length > 0 ? days.map((d) => getDisplayDay(d)).join(', ') : 'Ingen planlagte kontordager'}
        </BodyShort>
        {information && <BodyShort className={css`margin-top: 0px;`}>{information}</BodyShort>}
      </div>
    )
}
export const getDisplayDay = (day: string) => {
    switch (day) {
      case 'MONDAY':
        return 'Mandag'
      case 'TUESDAY':
        return 'Tirsdag'
      case 'WEDNESDAY':
        return 'Onsdag'
      case 'THURSDAY':
        return 'Torsdag'
      case 'FRIDAY':
        return 'Fredag'
      default:
        break
    }
}

interface LocationSectionProps {
    team: ProductTeam
    productArea?: ProductArea
    contactAddresses?: ContactAddress[]
}
const LocationSection = (props: LocationSectionProps) => {
    const { team, productArea, contactAddresses } = props

    return (
        <div>
            <Heading size="medium" className={css`font-size: 22px; font-weight: 600;`}>Her finner du oss</Heading>
            <Divider />
            {team.officeHours && (
                <>
                    <div className={rowStyling}>
                        <div className={iconDivStyling}> <img src={locationIcon} alt="Lokasjon" /></div>
                        <TextWithLabel label={'Lokasjon'} text={<Link to={`/location/${team.officeHours?.location.code}`}>{team.officeHours?.location.displayName}</Link>} />
                    </div>
                </>
            )}

            <div className={rowStyling}>
                  <div className={iconDivStyling}> <img src={slackIcon} alt="Slack kanal" /></div>
                  <TextWithLabel label="Slack" text={!team.slackChannel ? 'Fant ikke slack kanal' : <SlackLink channel={team.slackChannel} />} />
            </div>
            
            <div className={rowStyling}>
                  <div className={iconDivStyling}> <img src={slackIcon} alt="Kontaktperson" /></div>
                  <TextWithLabel
                    label="Kontaktperson"
                    text={team.contactPersonResource ? 
                          <Link to={`/resource/${team.contactPersonResource.navIdent}`}>{team.contactPersonResource.fullName}</Link> 
                          : 'Ingen fast kontaktperson'
                    }
                  />
            </div>

            {team.officeHours && (
              <>
                {team.officeHours.days && (
                    <div className={rowStyling}>
                      <div className={iconDivStyling}> <img src={officeDaysIcon} alt="Planlagte kontordager ikon" /></div>
                        <TextWithLabel label={'Planlagte kontordager'} text={displayOfficeHours(team.officeHours.days, team.officeHours.information)} />
                    </div>
                )}
              </>

            )}
        </div>
    )
}

export default LocationSection