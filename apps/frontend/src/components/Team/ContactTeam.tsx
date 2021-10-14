import Button from '../common/Button'
import { faMailBulk } from '@fortawesome/free-solid-svg-icons'
import { ContactAddress, ProductTeam, Resource, TeamRole } from '../../constants'

interface propsinterface {
  team?: ProductTeam
  contactPersonResource?: Resource
}

function sendEmail(email: string) {
  document.location.href = 'mailto:' + email
}

function validateContactAddresses(contactAddresses: ContactAddress[]) {
  let state = false
  if (contactAddresses?.length != 0) {
    contactAddresses.forEach((element) => {
      if (element.type === 'EPOST') {
        state = true
      }
    })
  }
  return state
}

function getEmail(contactAddresses: ContactAddress[]) {
  let email = ''
  contactAddresses.forEach((element) => {
    if (element.type === 'EPOST') {
      email = element.address
    }
  })
  return email
}

const dummyArray: ContactAddress[] = []

function getContactInfo(props: propsinterface) {
  const teamLeader = props.team?.members.filter((tLeader) => tLeader.roles.includes(TeamRole.LEAD)) ?? null
  const productOWner = props.team?.members.filter((tLeader) => tLeader.roles.includes(TeamRole.PRODUCT_OWNER)) ?? null
  if (props.contactPersonResource?.email != null) {
    sendEmail(props.contactPersonResource.email)
  } else if (props.team?.contactAddresses.length != 0 && validateContactAddresses(props.team?.contactAddresses || dummyArray)) {
    sendEmail(getEmail(props.team?.contactAddresses || dummyArray))
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
