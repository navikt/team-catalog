import { ErrorMessage } from 'formik'
import { Block, BlockProps } from 'baseui/block'
import { KIND as NKIND, Notification } from 'baseui/notification'
import { LabelMedium } from 'baseui/typography'
import * as React from 'react'
import { PLACEMENT, StatefulTooltip } from 'baseui/tooltip'
import { theme } from '../../util'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import { paddingZero } from './Style'

type ModalBlockProps = {
  blockProps?: BlockProps
  tooltip?: string
}

export const Error = (props: { fieldName: string; fullWidth?: boolean }) => (
  <ErrorMessage name={props.fieldName}>
    {(msg) => (
      <Block display="flex" width="100%" marginTop=".2rem">
        {!props.fullWidth && <ModalLabel />}
        <Block width="100%">
          <Notification overrides={{ Body: { style: { width: 'auto', ...paddingZero, marginTop: 0 } } }} kind={NKIND.negative}>
            {msg}
          </Notification>
        </Block>
      </Block>
    )}
  </ErrorMessage>
)

export const ModalLabel = (props: { label?: string; tooltip?: string | React.ReactElement; required?: boolean; subText?: React.ReactNode }) => {
  return (
    <Block minWidth="25%" width={'25%'} alignSelf="center" paddingRight=".5rem">
      {props.tooltip ? (
        <StatefulTooltip content={props.tooltip} placement={PLACEMENT.top}>
          <LabelMedium font="font300" display="flex" width="100%" justifyContent={'flex-start'}>
            <Block maxWidth={'100%'}>
              {props.label} {props.required ? <span color={'red'}>*</span> : ''}
            </Block>
            <FontAwesomeIcon style={{ marginLeft: '.5rem', alignSelf: 'center' }} icon={faExclamationCircle} color={theme.colors.primary300} size="sm" />
          </LabelMedium>
        </StatefulTooltip>
      ) : (
        <LabelMedium font="font300">
          {props.label}{' '}
          {props.required ? (
            <Block color={'red'} display={'inline'}>
              *
            </Block>
          ) : (
            ''
          )}
        </LabelMedium>
      )}
      {props.subText && <Block marginTop={theme.sizing.scale200}>{props.subText}</Block>}
    </Block>
  )
}

export const ModalBlock: React.FunctionComponent<ModalBlockProps> = (props) => {
  return (
    <Block {...props.blockProps}>
      {props.blockProps?.children}
      {props.tooltip && (
        <StatefulTooltip
          content={props.tooltip}
          placement={PLACEMENT.top}
          overrides={{
            Body: {
              style: {
                maxWidth: '400px',
              },
            },
          }}
        >
          <LabelMedium font="font300" display="flex" justifyContent="space-between">
            <FontAwesomeIcon style={{ marginRight: '.5rem', marginLeft: '10px' }} icon={faExclamationCircle} color={theme.colors.primary300} size="sm" />
          </LabelMedium>
        </StatefulTooltip>
      )}
    </Block>
  )
}

export function CustomNotification(props: { message: string }) {
  return (
    <Notification overrides={{ Body: { style: { width: 'auto', ...paddingZero, marginTop: 0 } } }} kind={NKIND.negative}>
      {props.message}
    </Notification>
  )
}
