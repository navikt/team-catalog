import * as React from 'react'
import { Block } from 'baseui/block'
import { LabelLarge } from 'baseui/typography'

const AccordionTitle = (props: { title: string }) => {
  const { title } = props
  return (
    <>
      <Block width="100%" padding="5px">
        <LabelLarge>
          <span>{title}</span>
        </LabelLarge>
      </Block>
    </>
  )
}

export default AccordionTitle
