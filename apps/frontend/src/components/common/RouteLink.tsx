import {RouteComponentProps, withRouter} from "react-router-dom";
import {StyledLink} from "baseui/link"
import React from "react"
import {NavigableItem} from "../../constants";

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

export const urlForObject = async (type: NavigableItem, id: string) => {
  switch (type) {
    case 'team':
      return `/team/${id}`
    case 'productArea':
      return `/productarea/${id}`
  }
  console.warn('couldn\'t find object type ' + type)
  return ''
}

export default withRouter(RouteLink)
