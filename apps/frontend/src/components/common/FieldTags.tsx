import * as React from 'react'
import {FieldArray} from 'formik'
import {Block} from 'baseui/block'
import {RenderTagList} from "./TagList"
import {useTagSearch} from "../../api"
import {Select, Value} from "baseui/select"

const FieldTags = () => {

  const [value, setValue] = React.useState<Value>([])
  const [teamSearchResult, setTeamSearch, teamSearchLoading] = useTagSearch()

  return (
    <FieldArray
      name='tags'
      render={(arrayHelpers) => (
        <Block width={"100%"}>
          <Block width={'100%'}>
            <Select
              options={teamSearchResult}
              maxDropdownHeight="400px"
              onChange={({value}) => {
                if (value.length > 0 && value && !arrayHelpers.form.values.tags.includes(value[0].id)) {
                  arrayHelpers.push(value[0].id)
                  setValue([])
                }
              }}
              onInputChange={event => setTeamSearch(event.currentTarget.value)}
              value={value}
              isLoading={teamSearchLoading}
              placeholder="Tagg"
              creatable={true}
              getOptionLabel={args => {
                return (args.option?.isCreatable === true) ? "" + args.option?.label : args.option?.label
              }}
            />
          </Block>
          <Block>
            <RenderTagList list={arrayHelpers.form.values.tags} onRemove={(index: number) => arrayHelpers.remove(index)}/>
          </Block>
        </Block>
      )}
    />
  )
}

export default FieldTags
