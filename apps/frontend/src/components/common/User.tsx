import { StatefulTooltip } from 'baseui/tooltip'
import React from 'react'

const identPattern = /[A-Z]\d{6} - .*/

export const AuditName = (props: { name: string }) => {
  const {name} = props
  if (!name) return null

  if (identPattern.test(name)) {
    return <StatefulTooltip content={name.substr(0, 7)}>
      {name.substr(10)}
    </StatefulTooltip>
  }
  return <>{name}</>
}
