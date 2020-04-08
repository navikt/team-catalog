import {ModalLabel} from "../common/ModalSchema";
import {Field, FieldProps} from "formik";
import {Block} from "baseui/block";
import {Select, Value} from "baseui/select";
import * as React from "react";
import {useEffect} from "react";
import {getResourceById, useResourceSearch} from "../../api/resourceApi";

const TeamLeader = (props:{teamLeaderId?:string}) => {
  const [teamLeader, setTeamLeader] = React.useState<Value>([])
  const [searchResult, setResourceSearch, loading] = useResourceSearch()

  useEffect( () =>{
    (async ()=>{
      if(props.teamLeaderId) {
        let response = (await getResourceById(props.teamLeaderId));
        setTeamLeader([{
          id:response.navIdent,
          name: `${response.givenName} ${response.familyName} (${response.navIdent})`,
          display: `${response.givenName} ${response.familyName} (${response.navIdent})`
        }])
      } else{
        setTeamLeader([])
      }
    })()
  },[])

  return (
    <>
      <ModalLabel label='Teamleder'/>
      <Field name='teamLeader'>
        {(props: FieldProps) =>
          <Block width="100%">
            <Select
              options={!loading ? searchResult : []}
              filterOptions={options => options}
              maxDropdownHeight="400px"
              onChange={({value}) => {
                setTeamLeader(value)
                console.log(value)
                props.form.setFieldValue('teamLeaderName', value.length > 0 ? value[0].name : '')
                props.form.setFieldValue('teamLeader', value.length > 0 ? value[0].id : '')
              }}
              onInputChange={async event => setResourceSearch(event.currentTarget.value)}
              value={teamLeader}
              isLoading={loading}
              placeholder="Søk etter ansatte"
              labelKey="display"
            />
          </Block>
        }
      </Field>
    </>
  )
}

export default TeamLeader
