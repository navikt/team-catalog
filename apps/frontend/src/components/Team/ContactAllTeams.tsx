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
const contactTeams = async (productTeams: ProductTeam[]) => {
  let emails = ''

  const arrayEmails = (
    await Promise.all(
      productTeams.map((pt: ProductTeam) => {
        return getContactAddress(pt)
      })
    )
  )
    .filter((n) => n)
    .map((email) => {
      emails += email + '; '
    })

  document.location.href = 'mailto:' + emails
}

const getContactAddress = async (productTeam: ProductTeam) => {
  const teamLeader = productTeam.members.filter((tLeader) => tLeader.roles.includes(TeamRole.LEAD)) ?? null
  const productOWner = productTeam.members.filter((po) => po.roles.includes(TeamRole.PRODUCT_OWNER)) ?? null
  let contactAddress = ''
  if (productTeam.contactPersonIdent) {
    const res = await getResourceById(productTeam.contactPersonIdent)
    contactAddress = res.email
  } else if (productTeam.contactAddresses.length != 0 && validateContactAddresses(productTeam.contactAddresses)) {
    contactAddress = getEmail(productTeam.contactAddresses)
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
