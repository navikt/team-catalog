import { Tooltip } from "@navikt/ds-react"

const identPattern = /[A-Z]\d{6} - .*/

export const AuditName = (props: { name: string }) => {
  const {name} = props
  if (!name) return null

  if (identPattern.test(name)) {
    return <Tooltip content={name.substr(0, 7)}>
      <span>{name.substr(10)}</span>
    </Tooltip>
  }
  return <>{name}</>
}