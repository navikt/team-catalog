import * as React from 'react'
import { useLocation } from 'react-router-dom'
import { trimEnd } from 'lodash'
import { css } from '@emotion/css'
import { Label } from '@navikt/ds-react'

// const listStyles = css`

// `

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

          {/* <FlexGrid
            flexGridColumnCount={[3, 3, 3, 4]}
            flexGridRowGap={theme.sizing.scale600}
            flexGridColumnGap={[theme.sizing.scale800, theme.sizing.scale800, theme.sizing.scale800, theme.sizing.scale600]}
          >
            {reducedList[letter].map((po) => (
              <FlexGridItem key={po.id}>
                <RouteLink href={`${trimEnd(current_pathname, '/')}/${po.id}`}>{po.name}</RouteLink>
              </FlexGridItem>
            ))}
          </FlexGrid> */}

          {/* <div className={listStyles}>
            

          </div> */}
        </div>
      ))}
    </>
  )
}

export default ListView
