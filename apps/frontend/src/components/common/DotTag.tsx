import React, {ReactNode} from 'react'
import {faCircle} from '@fortawesome/free-solid-svg-icons'
import {Block} from 'baseui/block'
import {theme} from '../../util'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import RouteLink from './RouteLink'


export const DotTag = (props: {children: ReactNode}) =>
  <Block marginLeft={theme.sizing.scale100} marginRight={theme.sizing.scale100} display='flex' alignItems='center'>
    <FontAwesomeIcon icon={faCircle} color={theme.colors.positive400} style={{fontSize: '.45rem'}} aria-hidden={true}/>
    <Block display='inline' marginRight={theme.sizing.scale100}/>
    <Block $style={{whiteSpace: 'nowrap', ...theme.typography.ParagraphMedium}}>
      {props.children}
    </Block>
  </Block>

export const DotTags = (props: {baseUrl?: string, items?: string[], children?: ReactNode[]}) => {
  const items = props.items || props.children || []
  if (!items.length) return null

  return (
    <Block display='flex' flexWrap marginTop={'1em'} marginBottom={'1em'}>
      {items.map((item, i) => (
        <Block key={i} marginRight={i < items.length ? theme.sizing.scale200 : 0}>
          <DotTag>{props.baseUrl ? <RouteLink href={props.baseUrl + item}>{item}</RouteLink> : item}</DotTag>
        </Block>
      ))}
    </Block>
  )
}
