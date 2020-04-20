import {Block} from "baseui/block";
import * as React from "react";

const SearchLabel = (props: { name: string, type: string }) => {
  return (
    <Block display="flex" justifyContent="space-between" width="100%">
      <span>{props.name}</span>
      <Block $style={{opacity: .5}}>{props.type}</Block>
    </Block>
  )
}

export default SearchLabel
