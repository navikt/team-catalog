import * as React from "react";
import { Field, FieldProps } from "formik";
import { Checkbox, LABEL_PLACEMENT } from "baseui/checkbox";
import { ModalLabel } from "../common/ModalSchema";

const FieldTeamLeaderQA = (props: { teamLeaderId?: string, teamLeadQA?: boolean }) => {
  const [teamLeadQA, setTeamLeadQA] = React.useState(props.teamLeadQA);
  return (
    <>
      <ModalLabel label={"Innholdet er kvalitetssikret av teamleder"}/>
      <Field name='teamLeadQA'>
        {(props: FieldProps) =>
          <Checkbox
            checked={teamLeadQA}
            onChange={e => {
              setTeamLeadQA((e.target as HTMLInputElement).checked)
              props.form.setFieldValue('teamLeadQA', (e.target as HTMLInputElement).checked)
            }}
            labelPlacement={LABEL_PLACEMENT.left}
          />
        }
      </Field>
    </>
  )
}

export default FieldTeamLeaderQA
