import {Option, Select, Value} from "baseui/select";
import * as React from "react";
import {Block} from "baseui/block";


const FieldCluster = (props: {onAdd: Function, options: Option[], values: string[]}) => {
  const [value, setValue] = React.useState<Value>([])

  return (
    <Block width={'100%'}>
      <Select
        options={props.options.filter(o => props.values.indexOf(o.id as string) < 0)}
        maxDropdownHeight="400px"
        onChange={({value}) => {
          setValue([])
          if (props.onAdd && value.length > 0) props.onAdd(value[0].id)
        }}
        value={value}
        placeholder="Søk og legg til klynge"
      />
    </Block>
  )
}

export default FieldCluster
