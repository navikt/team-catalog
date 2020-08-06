import {useHistory} from "react-router-dom";
import {StyledLink} from "baseui/link"
import React from "react"
import {AuditItem, NavigableItem, ObjectType} from '../admin/audit/AuditTypes'
import {useStyletron} from 'baseui'
import {Block} from 'baseui/block'
import {AuditButton} from '../admin/audit/AuditButton'
import {KIND} from 'baseui/button'

type RouteLinkProps = {
  href: string,
  hideUnderline?: boolean
} & any

const RouteLink = (props: RouteLinkProps) => {
  const {hideUnderline, ...restprops} = props
  const history = useHistory()
  const [useCss] = useStyletron();
  const linkCss = useCss({textDecoration: 'none'});
  return (
    <StyledLink className={props.hideUnderline ? linkCss : undefined} {...restprops} onClick={(e: Event) => {
      e.preventDefault()
      history.push(props.href)
    }}/>
  )
}

export default RouteLink

type ObjectLinkProps = {
  id: string
  type: NavigableItem
  audit?: AuditItem
  withHistory?: boolean
  children?: any
  disable?: boolean
  hideUnderline?: boolean
}

export const urlForObject = (type: NavigableItem, id: string, audit?: AuditItem) => {
  switch (type) {
    case ObjectType.Team:
      return `/team/${id}`
    case ObjectType.ProductArea:
      return `/productarea/${id}`
    case ObjectType.Resource:
      return `/resource/${id}`
    case ObjectType.Tag:
      return `/tag/${id.match(/.*_/)!.pop()!.slice(0, -1)}`
    case ObjectType.Settings:
      return `/admin/settings`
  }
  console.warn('couldn\'t find object type ' + type)
  return ''
}

export const ObjectLink = (props: ObjectLinkProps) => {
  const [useCss] = useStyletron();
  const linkCss = useCss({textDecoration: 'none'});

  const link =
    props.disable ? props.children :
      <RouteLink href={urlForObject(props.type, props.id, props.audit)}
                 className={props.hideUnderline ? linkCss : undefined}>
        {props.children}
      </RouteLink>

  return props.withHistory ?
    <Block display="flex" justifyContent="space-between" width="100%" alignItems="center">
      {link}
      <AuditButton id={props.id} kind={KIND.tertiary}/>
    </Block> :
    link
}
