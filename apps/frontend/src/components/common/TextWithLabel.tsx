import * as React from "react";
import { Block } from "baseui/block";
import { theme } from "../../util";
import { Label2, Paragraph2 } from "baseui/typography";

export const TextWithLabel = (props: { label: string, text: React.ReactNode }) => (
  <Block marginTop={theme.sizing.scale600}>
    <Label2>{props.label}</Label2>
    <Paragraph2 as='div' $style={{marginBottom: "1em", marginTop: "1em"}}>{props.text}</Paragraph2>
  </Block>
)
