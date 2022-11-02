import { Tooltip } from "@navikt/ds-react"

const identPattern = /[A-Z]\d{6} - .*/

export const AuditName = (properties: { name: string }) => {
  const {name} = properties
  if (!name) return <></>

  if (identPattern.test(name)) {
    return <Tooltip content={name.slice(0, 7)}>
      <span>{name.slice(10)}</span>
    </Tooltip>
  }
  return <>{name}</>
}