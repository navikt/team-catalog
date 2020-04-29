import React from 'react'
import { Card } from 'baseui/card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { theme } from '../../util'
import { Label1, Label4 } from 'baseui/typography'
import { Block } from 'baseui/block'


export const TextBox = (props: { title: string, value: string | number, icon?: IconProp, subtext?: string, }) => {

  return (
    <Card>
      <Block display='flex' flexDirection='column' alignItems='center' justifyContent='space-around'
             width='160px'
             height={theme.sizing.scale4800}
      >
        {props.icon && <FontAwesomeIcon icon={props.icon} size='2x' color={theme.colors.accent300}/>}
        <Label1 color={theme.colors.accent300} $style={{textAlign: 'center'}}>{props.title}</Label1>
        <Label1 $style={{fontSize: '2.5em'}}>{props.value}</Label1>
        {props.subtext && <Label4>{props.subtext}</Label4>}
      </Block>
    </Card>
  )
}
