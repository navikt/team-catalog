import * as React from "react";
import {Block, BlockProps} from "baseui/block";
import {theme} from "../../util";
import {Label2, Paragraph2} from "baseui/typography";

export const TextWithLabel = (props: {label: React.ReactNode, text: React.ReactNode} & BlockProps) => {
  const {label, text, ...restProps} = props
  return (
    <Block marginTop={theme.sizing.scale600} {...restProps}>
      <Label2>{label}</Label2>
      <Paragraph2 as='div' $style={{marginBottom: "1.25em", marginTop: "0.5em"}} color={props.color && props.color}>{text}</Paragraph2>
    </Block>
  )
}
