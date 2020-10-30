import {Option, Select, Value} from "baseui/select";
import * as React from "react";
import {Block} from "baseui/block";


const FieldCluster = (props: {onAdd: Function, options: Option[]}) => {
  const [value, setValue] = React.useState<Value>([])

  return (
    <Block width={'100%'}>
      <Select
        options={props.options}
        maxDropdownHeight="400px"
        onChange={({value}) => {
          setValue(value)
          if (props.onAdd && value.length > 0) props.onAdd(value[0].id)
        }}
        value={value}
        placeholder="Søk og legg til team"
      />
    </Block>
  )
}

export default FieldCluster
