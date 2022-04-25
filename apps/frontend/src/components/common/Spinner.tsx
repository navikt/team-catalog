import { withStyle } from 'baseui'
import { Spinner } from 'baseui/spinner'
import React from 'react'

export const CustomSpinner = (props: { size?: string }) => {
  const SpinnerStyled = withStyle(Spinner, { width: props.size, height: props.size })
  return <SpinnerStyled />
}
