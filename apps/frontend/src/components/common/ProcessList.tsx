import { Process } from '../../constants'
import { Block } from 'baseui/block'
import { LabelLarge } from 'baseui/typography'
import { theme } from '../../util'
import { StyledLink } from 'baseui/link'
import { StatefulTooltip } from 'baseui/tooltip'
import * as React from 'react'
import { ObjectType } from '../admin/audit/AuditTypes'
import { intl } from '../../util/intl/intl'
import { processLink } from '../../util/config'

export const ProcessList = (props: { parentType: ObjectType.Team | ObjectType.ProductArea | ObjectType.Cluster; processes: Process[] }) => {
  const { parentType, processes } = props

  if (!processes.length) {
    return null
  }

  return (
    <Block width="100%">
      <LabelLarge marginBottom={theme.sizing.scale600}>
        Behandlinger registrert på {intl[parentType]} i Behandlingskatalogen ({processes.length})
      </LabelLarge>
      {processes
        .sort((a, b) => (a.purposeName + ': ' + a.name).localeCompare(b.purposeName + ': ' + b.name))
        .map((p) => (
          <Block key={p.id} marginBottom={theme.sizing.scale200}>
            <StyledLink href={processLink(p)} target="_blank" rel="noopener noreferrer">
              <StatefulTooltip content={p.purposeDescription}>{p.purposeName + ': ' + p.name}</StatefulTooltip>
            </StyledLink>
          </Block>
        ))}
    </Block>
  )
}
