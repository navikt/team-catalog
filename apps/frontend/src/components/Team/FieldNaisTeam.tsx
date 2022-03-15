import * as React from 'react'
import {Select, Value} from 'baseui/select'
import {useNaisTeamSearch} from '../../api'
import {Block} from 'baseui/block'

const FieldNaisTeam = (props: {onAdd: Function, values: string[]}) => {
  const [value, setValue] = React.useState<Value>([])
  const [teamSearchResult, setTeamSearch, teamSearchLoading] = useNaisTeamSearch()

  console.log('')
  return (
    <Block width={'100%'}>
      <Select
        disabled={true}
        options={teamSearchResult.filter(o => props.values.indexOf(o.id as string) < 0)}
        maxDropdownHeight="400px"
        onChange={({value}) => {
          setValue([])
          if (props.onAdd && value.length > 0) props.onAdd(value[0].id)
        }}
        onInputChange={event => setTeamSearch(event.currentTarget.value)}
        value={value}
        isLoading={teamSearchLoading}
        placeholder="Deaktivert inntil videre"
      />
    </Block>
  )
}

export default FieldNaisTeam
