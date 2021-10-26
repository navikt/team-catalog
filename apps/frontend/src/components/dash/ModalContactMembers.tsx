import * as React from 'react'
import Button from '../common/Button'
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalButton } from 'baseui/modal'
import { MemberExt } from './MemberList'
import { faMailBulk } from '@fortawesome/free-solid-svg-icons'

interface propsInterface {
  members?: MemberExt[]
}

const contactMembersOutlook = (props: propsInterface) => {
  let emails = ''
  props.members?.map((element) => {
    emails = emails.concat(element.email + '; ')
  })
  document.location.href = 'mailto:' + emails
}

const contactMembersCopy = (props: propsInterface) => {
  let emails = ''
  props.members?.map((element) => {
    emails = emails.concat(element.email + '; ')
  })
  navigator.clipboard.writeText(emails)
}

const modalButtonStyle = {
  marginRight: '0px',
}

export default function ModalContactMembers(props: { members?: MemberExt[] }) {
  const [isOpen, setIsOpen] = React.useState(false)
  function close() {
    setIsOpen(false)
  }
  return (
    <React.Fragment>
      <Button tooltip="Kontakt personer" icon={faMailBulk} kind="outline" size="compact" onClick={() => setIsOpen(true)}>
        kontakt alle medlemmer
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
        <ModalHeader>Kontakt personer</ModalHeader>
        <ModalBody>Hvis "Åpne Outlook" knappen ikke fungerer bruk "Kopier eposter" knappen og lim disse inn i din epost klient </ModalBody>
        <ModalButton
          {...{ modalButtonStyle }}
          onClick={async () => {
            await contactMembersOutlook(props)
          }}
        >
          {' '}
          Åpne Outlook{' '}
        </ModalButton>
        <ModalButton
          {...{ modalButtonStyle }}
          onClick={async () => {
            await contactMembersCopy(props)
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
