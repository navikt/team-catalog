import * as React from 'react'
import { Accordion, Panel } from 'baseui/accordion'
import { TeamMember } from '../../constants'
import AccordionTitle from '../common/AccordionTitle'
import { theme } from '../../util'
import { Block } from 'baseui/block'
import { Label2, Paragraph2 } from 'baseui/typography'

const panelOverrides = {
  Header: {
    style: {
      paddingLeft: '0'
    }
  },
  Content: {
    style: {
      backgroundColor: theme.colors.white,
    }
  },
  ToggleIcon: {
    component: () => null
  }
}

const Row = (props: { label: string, text?: string }) => (
  <Block display="flex" alignItems="baseline">
    <Block width="20%"><Label2>{props.label}</Label2></Block>
    <Paragraph2>{props.text ? props.text : 'Fant ingen Nav-Ident'}</Paragraph2>
  </Block>
)

type AccordionMembersProps = {
  members: TeamMember[]
}

const AccordionMembers = (props: AccordionMembersProps) => {
  const [isPanelExpanded, togglePanel] = React.useReducer(prevState => !prevState, false)

  const {members} = props

  return (
    <Accordion>
      {members.map((member: TeamMember, index: number) => (
        <Panel
          key={index}
          title={<AccordionTitle title={member.resource.fullName || ''} expanded={isPanelExpanded}/>}
          onChange={togglePanel}
          overrides={{...panelOverrides}}
        >
          <Row label="Navn" text={member.resource.fullName}/>
          <Row label="Nav-Ident" text={member.navIdent}/>
          <Row label="Rolle" text={JSON.stringify(member.roles)}/>
        </Panel>
      ))}
    </Accordion>
  )
}

export default AccordionMembers
