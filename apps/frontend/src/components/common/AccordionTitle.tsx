import * as React from 'react'
import { Block } from 'baseui/block'
import { Label1 } from 'baseui/typography'

const AccordionTitle = (props: { title: string}) => {
    const { title } = props
    return <>
        <Block width="100%" padding="5px">
            <Label1>
                <span>{title}</span>
            </Label1>
        </Block>
    </>
}

export default AccordionTitle