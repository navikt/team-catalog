import { ModalLabel } from "../common/ModalSchema";
import { Field, FieldProps } from "formik";
import { Select, Value } from "baseui/select";
import * as React from "react";
import { useEffect } from "react";
import { getResourceById, useResourceSearch } from "../../api/resourceApi";
import { ProductTeamFormValues } from '../../constants'

const FieldTeamLeader = (props: { teamLeaderId?: string, teamLeader:Value, setTeamLeader:Function}) => {
  const [searchResult, setResourceSearch, loading] = useResourceSearch()
  const {teamLeader, setTeamLeader, teamLeaderId} = props

  useEffect(() => {
    (async () => {
      if (teamLeaderId) {
        let response = (await getResourceById(teamLeaderId));
        setTeamLeader([{
          id: response.navIdent,
          label: `${response.givenName} ${response.familyName} (${response.navIdent})`
        }])
      } else {
        setTeamLeader([])
      }
    })()
  }, [])

  return (
    <>
      <ModalLabel label='Teamleder'/>
        <Field name='teamLeader'>
          {(props: FieldProps<string, ProductTeamFormValues>) =>
              <Select
                options={!loading ? searchResult : []}
                filterOptions={options => options}
                maxDropdownHeight="400px"
                onChange={({value}) => {
                  setTeamLeader(value)
                  props.form.setFieldValue('teamLeaderName', value.length > 0 ? value[0].name : '')
                  props.form.setFieldValue('teamLeader', value.length > 0 ? value[0].id : '')
                }}
                onInputChange={async event => setResourceSearch(event.currentTarget.value)}
                value={teamLeader}
                isLoading={loading}
                placeholder="Søk etter ansatte"
              />
          }
        </Field>
    </>
  )
}

export default FieldTeamLeader
