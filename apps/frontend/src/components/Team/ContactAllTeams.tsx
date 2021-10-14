import Button from '../common/Button'
import { faMailBulk } from '@fortawesome/free-solid-svg-icons'
import { ContactAddress, ProductTeam, TeamRole } from '../../constants'
import { getResourceById } from '../../api'

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

function contactTeams(props: ProductTeam[]) {
  let emails = ''
  let tempEmails: string[] = []
  let currentEmail = ''
  props.forEach(function (element) {
    currentEmail = getContactAddress(element)
    if (currentEmail != '') {
      tempEmails.push(currentEmail)
    }
    currentEmail = ''
  })

  tempEmails = tempEmails.filter((v, i, a) => a.indexOf(v) === i)
  tempEmails.forEach(function (elements) {
    emails = emails.concat(elements + '; ')
  })
  document.location.href = 'mailto:' + emails
}

// TODO Mangler kontakt person
function getContactAddress(prop: ProductTeam) {
  const teamLeader = prop.members.filter((tLeader) => tLeader.roles.includes(TeamRole.LEAD)) ?? null
  const productOWner = prop.members.filter((tLeader) => tLeader.roles.includes(TeamRole.PRODUCT_OWNER)) ?? null

  let contactAddress = ''

  if (prop.contactPersonIdent) {
    const res = async (ident: string) => {
      const user = await getResourceById(prop.contactPersonIdent || '')
    }
    console.log({ res })
  } else if (prop.contactAddresses.length != 0 && validateContactAddresses(prop.contactAddresses)) {
    contactAddress = getEmail(prop.contactAddresses)
  } else if (teamLeader.length != 0) {
    teamLeader.forEach(function (value) {
      contactAddress = value.resource.email || ''
    })
  } else if (productOWner.length != 0) {
    productOWner.forEach(function (value) {
      contactAddress = value.resource.email || ''
    })
  }
  return contactAddress
}

export const ContactAllTeams = (props: { teams: ProductTeam[] }) => {
  return (
    <Button tooltip="Kontakt alle team" icon={faMailBulk} kind="outline" size="compact" marginLeft onClick={() => contactTeams(props.teams)}>
      Kontakt alle Team
    </Button>
  )
}
