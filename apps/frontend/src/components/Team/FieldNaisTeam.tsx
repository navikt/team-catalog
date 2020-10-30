import * as React from 'react'
import {Select, Value} from 'baseui/select'
import {useNaisTeamSearch} from '../../api'
import {Block} from 'baseui/block'

const FieldNaisTeam = (props: {onAdd: Function}) => {
  const [value, setValue] = React.useState<Value>([])
  const [teamSearchResult, setTeamSearch, teamSearchLoading] = useNaisTeamSearch()

  return (
    <Block width={'100%'}>
      <Select
        options={teamSearchResult}
        maxDropdownHeight="400px"
        onChange={({value}) => {
          setValue(value)
          if (props.onAdd && value.length > 0) props.onAdd(value[0].id)
        }}
        onInputChange={event => setTeamSearch(event.currentTarget.value)}
        value={value}
        isLoading={teamSearchLoading}
        placeholder="Søk og legg til team"
      />
    </Block>
  )
}

export default FieldNaisTeam
