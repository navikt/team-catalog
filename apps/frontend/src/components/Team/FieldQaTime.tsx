import * as React from 'react'
import { Field, FieldProps } from 'formik'
import { ModalLabel } from '../common/ModalSchema'
import Button from '../common/Button'
import { Block } from 'baseui/block'
import moment from 'moment'
import { ParagraphMedium } from 'baseui/typography'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-solid-svg-icons'

const FieldQaTime = (props: { qaTime?: string }) => {
  return (
    <>
      <ModalLabel label={'Innholdet er kvalitetssikret av teamet'} />
      <Field name="qaTime">
        {(fieldProps: FieldProps) => (
          <Block display="flex" justifyContent="space-between" width="100%">
            <ParagraphMedium>
              {props.qaTime ? (
                <span>
                  <FontAwesomeIcon icon={faClock} /> {moment(props.qaTime).format('lll')}
                </span>
              ) : (
                'Ikke kvalitetssikret'
              )}
            </ParagraphMedium>
            <Block>
              <Button
                type="button"
                kind="secondary"
                size="compact"
                onClick={() => {
                  fieldProps.form.setFieldValue('qaTime', moment().format(moment.HTML5_FMT.DATETIME_LOCAL))
                }}
              >
                Sett kvalitetssikret nå
              </Button>
            </Block>
          </Block>
        )}
      </Field>
    </>
  )
}

export default FieldQaTime
