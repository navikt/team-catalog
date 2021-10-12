import Button from '../common/Button'
import { faMailBulk } from '@fortawesome/free-solid-svg-icons'
import { MemberExt } from './MemberList'

interface propsInterface {
  members?: MemberExt[]
}

function getContactInfo(props: propsInterface) {
  let emails = ''
  props.members?.forEach(function (value) {
    emails = emails.concat(value.email + '; ')
  })
  sendEmail(emails)
}

function sendEmail(email: string) {
  document.location.href = 'mailto:' + email
}

export const ContactMembers = (props: { members?: MemberExt[] }) => {
  return (
    <Button tooltip="Kontakt personer" icon={faMailBulk} kind="outline" size="compact" onClick={() => getContactInfo(props)}>
      Kontakt personer
    </Button>
  )
}
