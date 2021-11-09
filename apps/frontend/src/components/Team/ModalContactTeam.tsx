import * as React from 'react'
import Button from '../common/Button'
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalButton } from 'baseui/modal'
import { ContactAddress, ProductTeam, Resource, TeamRole } from '../../constants'
import { faMailBulk } from '@fortawesome/free-solid-svg-icons'

interface propsinterface {
  team?: ProductTeam
  contactPersonResource?: Resource
}

const sendEmail = (email: string) => {
  document.location.href = 'mailto:' + email
}

const copyEmail = (email: string) => {
  navigator.clipboard.writeText(email)
}

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

const dummyArray: ContactAddress[] = []

const contactTeamOutlook = (props: propsinterface) => {
  const teamLeader = props.team?.members.filter((tLeader) => tLeader.roles.includes(TeamRole.LEAD)) ?? null
  const productOwner = props.team?.members.filter((tLeader) => tLeader.roles.includes(TeamRole.PRODUCT_OWNER)) ?? null
  if (props.contactPersonResource?.email != null) {
    sendEmail(props.contactPersonResource.email)
  } else if (props.team?.contactAddresses.length != 0 && validateContactAddresses(props.team?.contactAddresses || dummyArray)) {
    sendEmail(getEmail(props.team?.contactAddresses || dummyArray))
  } else if (teamLeader?.length != 0) {
    teamLeader?.map((element) => {
      sendEmail(element.resource.email || '')
    })
  } else if (productOwner?.length != 0) {
    productOwner?.map((element) => {
      sendEmail(element.resource.email || '')
    })
  } else {
    alert('Ingen kontakt addresse')
  }
}

const contactTeamCopy = (props: propsinterface) => {
  const teamLeader = props.team?.members.filter((tLeader) => tLeader.roles.includes(TeamRole.LEAD)) ?? null
  const productOwner = props.team?.members.filter((tLeader) => tLeader.roles.includes(TeamRole.PRODUCT_OWNER)) ?? null
  if (props.contactPersonResource?.email != null) {
    copyEmail(props.contactPersonResource.email)
  } else if (props.team?.contactAddresses.length != 0 && validateContactAddresses(props.team?.contactAddresses || dummyArray)) {
    copyEmail(getEmail(props.team?.contactAddresses || dummyArray))
  } else if (teamLeader?.length != 0) {
    teamLeader?.map((element) => {
      copyEmail(element.resource.email || '')
    })
  } else if (productOwner?.length != 0) {
    productOwner?.map((element) => {
      copyEmail(element.resource.email || '')
    })
  } else {
    alert('Ingen kontakt addresse')
  }
}

const modalButtonStyle = {
  marginRight: '0px',
}

export default function ModalContactTeam(props: { team?: ProductTeam; contactPersonResource?: Resource }) {
  const [isOpen, setIsOpen] = React.useState(false)
  function close() {
    setIsOpen(false)
  }
  return (
    <React.Fragment>
      <Button tooltip="Kontakt personer" icon={faMailBulk} kind="outline" size="compact" onClick={() => setIsOpen(true)}>
        kontakt team
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
        <ModalHeader>Kontakt team</ModalHeader>
        <ModalBody>Hvis "Åpne epost klient" knappen ikke fungerer bruk "Kopier epost" knappen og lim dette inn i din epost klient </ModalBody>
        <ModalButton
          {...{ modalButtonStyle }}
          onClick={async () => {
            await contactTeamOutlook(props)
          }}
        >
          {' '}
          Åpne epost klient{' '}
        </ModalButton>
        <ModalButton
          {...{ modalButtonStyle }}
          onClick={async () => {
            await contactTeamCopy(props)
          }}
        >
          {' '}
          Kopier epost{' '}
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
