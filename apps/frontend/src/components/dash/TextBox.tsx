import React from 'react'
import { Card } from 'baseui/card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { theme } from '../../util'
import { LabelLarge, LabelXSmall } from 'baseui/typography'
import { Block } from 'baseui/block'
import { cardShadow } from '../common/Style'

export const TextBox = (props: { title: string; value: string | number; icon?: IconProp; subtext?: string }) => {
  return (
    <Card overrides={cardShadow}>
      <Block display="flex" flexDirection="column" alignItems="center" justifyContent="space-around" width="160px" height={theme.sizing.scale4800}>
        {props.icon && <FontAwesomeIcon icon={props.icon} size="2x" color={theme.colors.accent300} />}
        <LabelLarge color={theme.colors.accent300} $style={{ textAlign: 'center' }}>
          {props.title}
        </LabelLarge>
        <LabelLarge $style={{ fontSize: '2.5em' }}>{props.value}</LabelLarge>
        <LabelXSmall>{props.subtext}</LabelXSmall>
      </Block>
    </Card>
  )
}
