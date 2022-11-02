import { css } from '@emotion/css';
import { BodyShort, Label } from '@navikt/ds-react';
import * as React from 'react'

import type { Status } from '../constants'

export const TextWithLabel = (properties: { label: React.ReactNode; text: React.ReactNode; status?: Status, color?: string, marginTop?: string }) => {
  const { label, text, marginTop, color } = properties
  return (
    <div className={css`margin-top: ${marginTop || '1rem'}; `}>
      <Label>{label}</Label>
      <BodyShort className={css`margin-top: 0.5em; color: ${color && color};`}>
        {text}
      </BodyShort>
    </div>
  )
}
