import * as React from 'react'
import { Block, BlockProps } from 'baseui/block'
import { theme } from '../../util'
import { LabelMedium, ParagraphMedium } from 'baseui/typography'
import { Status } from '../../constants'

export const TextWithLabel = (props: { label: React.ReactNode; text: React.ReactNode; status?: Status } & BlockProps) => {
  const { label, text, ...restProps } = props
  return (
    <Block marginTop={theme.sizing.scale600} {...restProps}>
      <LabelMedium>{label}</LabelMedium>
      <ParagraphMedium as="div" $style={{ marginBottom: '1.25em', marginTop: '0.5em' }} color={props.color && props.color}>
        {text}
      </ParagraphMedium>
    </Block>
  )
}
