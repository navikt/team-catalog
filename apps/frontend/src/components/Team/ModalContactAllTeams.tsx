import * as React from 'react'
import Button from '../common/Button'
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalButton } from 'baseui/modal'
import { ContactAddress, ProductTeam, TeamRole } from '../../constants'
import { getResourceById } from '../../api'
import { faMailBulk } from '@fortawesome/free-solid-svg-icons'

const validateContactAddresses = (contactAddresses: ContactAddress[]) => {
  let state = false
  if (contactAddresses?.length != 0) {
    contactAddresses.map((element) => {
      if (element.type === 'EPOST') {
        state = true
      }
    })
  }
  return state
}

const getEmail = (contactAddresses: ContactAddress[]) => {
  let email = ''

  contactAddresses.map((element) => {
    if (element.type === 'EPOST') {
      email = element.address
    }
  })
  return email
}

const contactTeamsOutlook = async (productTeams: ProductTeam[]) => {
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

const contactTeamsCopy = async (productTeams: ProductTeam[]) => {
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
  navigator.clipboard.writeText(emails)
}

const getContactAddress = async (productTeam: ProductTeam) => {
  const teamLeader = productTeam.members.filter((tLeader) => tLeader.roles.includes(TeamRole.LEAD)) ?? null
  const productOwner = productTeam.members.filter((po) => po.roles.includes(TeamRole.PRODUCT_OWNER)) ?? null
  let contactAddress = ''
  if (productTeam.contactPersonIdent) {
    const res = await getResourceById(productTeam.contactPersonIdent)
    contactAddress = res.email
  } else if (productTeam.contactAddresses.length != 0 && validateContactAddresses(productTeam.contactAddresses)) {
    contactAddress = getEmail(productTeam.contactAddresses)
  } else if (teamLeader.length != 0) {
    teamLeader.map((element) => {
      contactAddress = element.resource.email || ''
    })
  } else if (productOwner.length != 0) {
    productOwner.map((element) => {
      contactAddress = element.resource.email || ''
    })
  }
  return contactAddress
}

const modalButtonStyle = {
  marginRight: '0px',
}

export default function ModalContactAllTeams(props: { teams: ProductTeam[] }) {
  const [isOpen, setIsOpen] = React.useState(false)
  function close() {
    setIsOpen(false)
  }
  return (
    <React.Fragment>
      <Button tooltip="Kontakt personer" icon={faMailBulk} kind="outline" size="compact" onClick={() => setIsOpen(true)}>
        kontakt alle team
      </Button>
      <Modal
        onClose={close}
        isOpen={isOpen}
        overrides={{
          Dialog: {
            style: ({ $theme }) => ({
              display: 'grid',
              padding: '1rem',
              rowGap: '1rem',
            }),
          },
        }}
      >
        <ModalHeader>Kontakt alle teamene</ModalHeader>
        <ModalBody>Hvis "Åpne Outlook" knappen ikke fungerer bruk "Kopier eposter" knappen og lim disse inn i din epost klient </ModalBody>
        <ModalButton
          {...{ modalButtonStyle }}
          onClick={async () => {
            await contactTeamsOutlook(props.teams)
          }}
        >
          {' '}
          Åpne Outlook{' '}
        </ModalButton>
        <ModalButton
          {...{ modalButtonStyle }}
          onClick={async () => {
            await contactTeamsCopy(props.teams)
          }}
        >
          {' '}
          Kopier eposter{' '}
        </ModalButton>
        <ModalFooter>
          <ModalButton kind="tertiary" onClick={close}>
            Lukk vindu
          </ModalButton>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  )
}
