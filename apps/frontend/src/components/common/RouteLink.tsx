import {RouteComponentProps, withRouter} from "react-router-dom";
import {StyledLink} from "baseui/link"
import React from "react"
import {AuditItem, NavigableItem, ObjectType} from '../admin/audit/AuditTypes'
import {useStyletron} from 'baseui'
import {Block} from 'baseui/block'
import {AuditButton} from '../admin/audit/AuditButton'
import {KIND} from 'baseui/button'

type RouteLinkProps = {
    href: string
}

const RouteLink = (props: RouteComponentProps<any> & RouteLinkProps & any) => {
    const { history, location, match, staticContext, ...restprops } = props
    return (
        <StyledLink {...restprops} onClick={(e: Event) => {
            e.preventDefault()
            props.history.push(props.href)
        }} />
    )
}

export default withRouter(RouteLink)

type ObjectLinkProps = {
  id: string
  type: NavigableItem
  audit?: AuditItem
  withHistory?: boolean
  children?: any
  disable?: boolean
  hideUnderline?: boolean
}

export const urlForObject = async (type: NavigableItem, id: string, audit?: AuditItem) => {
  switch (type) {
    case ObjectType.Team:
      return `/team/${id}`
    case ObjectType.ProductArea:
      return `/productarea/${id}`
    case ObjectType.Resource:
      return `/resource/${id}`
    case ObjectType.Settings:
      return `/admin/settings`
  }
  console.warn('couldn\'t find object type ' + type)
  return ''
}

const ObjectLinkImpl = (props: RouteComponentProps & ObjectLinkProps) => {
  const [useCss] = useStyletron();
  const linkCss = useCss({textDecoration: 'none'});

  const link =
    props.disable ? props.children :
      <StyledLink onClick={(e: Event) => {
        e.preventDefault();
        (async () => props.history.push(await urlForObject(props.type, props.id, props.audit)))()
      }} href='#' className={props.hideUnderline ? linkCss : undefined}>
        {props.children}
      </StyledLink>

  return props.withHistory ?
    <Block display="flex" justifyContent="space-between" width="100%" alignItems="center">
      {link}
      <AuditButton id={props.id} kind={KIND.tertiary}/>
    </Block> :
    link
}

export const ObjectLink = withRouter(ObjectLinkImpl)
