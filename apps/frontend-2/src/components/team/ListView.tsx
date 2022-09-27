import * as React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { trimEnd } from 'lodash'
import { css } from '@emotion/css'
import { Label } from '@navikt/ds-react'
import { theme } from '../../util/theme'

const listStyles = css`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-column-gap: 1rem;
  grid-row-gap: 1rem;
  @media only screen and (max-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-column-gap: 1rem;
    grid-row-gap: 1rem;
  }
`

type ListViewProps = {
  list: { id: string; name: string; description: string }[]
  prefixFilter?: string
  prefixFilters?: string[]
}

const ListView = (props: ListViewProps) => {
  const { list } = props
  const current_pathname = useLocation().pathname
  const prefixFilters = (props.prefixFilters ? props.prefixFilters : props.prefixFilter ? [props.prefixFilter] : []).map((f) => f.toUpperCase())

  const reducedList = list
    .map((item) => {
      let sortName = item.name.toUpperCase()
      let fLen = -1
      prefixFilters.forEach((f, i) => {
        if (sortName?.indexOf(f) === 0 && f.length > fLen) fLen = f.length
      })
      if (fLen > 0) {
        sortName = sortName.substring(fLen).trim()
      }
      return { ...item, sortName: sortName }
    })
    .sort((a, b) => a.sortName.localeCompare(b.sortName))
    .reduce((acc, cur) => {
      const letter = cur.sortName[0]
      acc[letter] = [...(acc[letter] || []), cur]
      return acc
    }, {} as { [letter: string]: { id: string; description: string; name: string }[] })

  return (
    <>
      {Object.keys(reducedList).map((letter) => (
        <div key={letter} className={css`margin-bottom: 24px;`}>
          <div key={letter} className={css`display: flex; align-items: center; margin-bottom: 24px;`}>
            <div
              className={css`
                display: flex;
                width: 32px;
                height: 32px;
                background-color: #C1DBF2;
                border-radius: 50%;
                align-items: center;
                justify-content: center;
              `}
            >
              <Label className={css`font-size: 1.2em;`}>{letter}</Label>
            </div>

            <div className={css`margin-bottom: 24px; margin-right: 10px;` } />
            <div className={css`width: 100%; border-bottom-style: solid; border-bottom-color: #E2E2E2; border-bottom-width: 2px; `} />
          </div>

          <div className={listStyles}>
            {reducedList[letter].map((po) => (
                <div key={po.id}>
                  <Link to={`${trimEnd(current_pathname, '/')}/${po.id}`} className={theme.linkWithUnderline}>{po.name}</Link>
                </div>
            ))}

          </div>
        </div>
      ))}
    </>
  )
}

export default ListView
