import Button from '../common/Button'
import { faMailBulk } from '@fortawesome/free-solid-svg-icons'
import { ProductTeam, Resource, TeamRole } from '../../constants'

interface propsinterface {
  team?: ProductTeam
  contactPersonResource?: Resource
}

function sendEmail(email: string) {
  document.location.href = 'mailto:' + email
}

function getContactInfo(props: propsinterface) {
  const teamLeader = props.team?.members.filter((tLeader) => tLeader.roles.includes(TeamRole.LEAD)) ?? null
  const productOWner = props.team?.members.filter((tLeader) => tLeader.roles.includes(TeamRole.PRODUCT_OWNER)) ?? null
  if (props.contactPersonResource?.email != null) {
    sendEmail(props.contactPersonResource.email)
  } else if (props.team?.contactAddresses.length != 0) {
    sendEmail(props.team?.contactAddresses[0].address || '')
  } else if (teamLeader?.length != 0) {
    teamLeader?.forEach(function (value) {
      sendEmail(value.resource.email || '')
    })
  } else if (productOWner?.length != 0) {
    productOWner?.forEach(function (value) {
      sendEmail(value.resource.email || '')
    })
  } else {
    alert('Ingen kontakt addresse')
  }
}

export const ContactTeam = (props: { team?: ProductTeam; contactPersonResource?: Resource }) => {
  return (
    <Button tooltip="Kontakt team" icon={faMailBulk} kind="outline" size="compact" marginLeft onClick={() => getContactInfo(props)}>
      Kontakt Team
    </Button>
  )
}
