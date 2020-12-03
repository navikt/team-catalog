import {InfoType} from '../../constants'
import {Block} from 'baseui/block'
import {Label1} from 'baseui/typography'
import {theme} from '../../util'
import {StyledLink} from 'baseui/link'
import * as React from 'react'
import {ObjectType} from '../admin/audit/AuditTypes'
import {intl} from '../../util/intl/intl'
import {infoTypeLink} from '../../util/config'


export const InfoTypeList = (props: {parentType: ObjectType.Team | ObjectType.ProductArea, infoTypes: InfoType[]}) => {
  const {parentType, infoTypes} = props

  if (!infoTypes.length) {
    return null
  }

  return (
    <Block width='100%'>
      <Label1 marginBottom={theme.sizing.scale600}>Opplysningstyper registrert på {intl[parentType]} i Behandlingskatalogen ({infoTypes.length})</Label1>
      {infoTypes.sort((a, b) => b.name.localeCompare(a.name)).map(p =>
        <Block key={p.id} marginBottom={theme.sizing.scale200}>
          <StyledLink href={infoTypeLink(p)} target="_blank" rel="noopener noreferrer">
            {p.name}
          </StyledLink>
        </Block>
      )}
    </Block>
  )
}
