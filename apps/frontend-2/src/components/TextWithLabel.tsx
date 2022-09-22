import { css } from '@emotion/css';
import { BodyShort, Label } from '@navikt/ds-react';
import * as React from 'react'
import { Status } from '../constants'

export const TextWithLabel = (props: { label: React.ReactNode; text: React.ReactNode; status?: Status, color?: string }) => {
  const { label, text, ...restProps } = props
  return (
    <div className={css`margin-top: 1rem; `}>
      <Label>{label}</Label>
      <BodyShort className={css`margin-top: 0.5em; color: ${props.color && props.color};`}>
        {text}
      </BodyShort>
    </div>
  )
}
