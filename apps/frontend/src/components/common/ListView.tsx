import * as React from 'react'
import {Label1} from 'baseui/typography'
import {FlexGrid, FlexGridItem} from 'baseui/flex-grid'
import {Block} from 'baseui/block'
import {theme} from '../../util'
import {primitives} from '../../util/theme'
import RouteLink from './RouteLink'
import {useLocation} from 'react-router-dom'
import {trimEnd} from 'lodash'

type ListViewProps = {
  list: {id: string, name: string, description: string}[]
  prefixFilter?: string
  prefixFilters?: string[]
}

const ListView = (props: ListViewProps) => {
  const {list} = props
  const current_pathname = useLocation().pathname
  const prefixFilters = (props.prefixFilters ? props.prefixFilters : props.prefixFilter ? [props.prefixFilter] : []).map(f => f.toUpperCase())

  const reducedList = list
  .map(item => {
    let sortName = item.name.toUpperCase()
    let fLen = -1
    prefixFilters.forEach((f, i) => {
      if (sortName?.indexOf(f) === 0 && f.length > fLen) fLen = f.length
    })
    if (fLen > 0) {
      sortName = sortName.substring(fLen).trim()
    }
    return ({...item, sortName: sortName})
  })
  .sort((a, b) => a.sortName.localeCompare(b.sortName))
  .reduce((acc, cur) => {
    const letter = cur.sortName[0]
    acc[letter] = [...(acc[letter] || []), cur]
    return acc
  }, {} as {[letter: string]: {id: string, description: string, name: string}[]})


  return (
    <>
      {Object.keys(reducedList).map(letter =>
        <Block key={letter} marginBottom={theme.sizing.scale800}>
          <Block key={letter} display='flex' alignItems='center' marginBottom={theme.sizing.scale800}>
            <Block
              width={theme.sizing.scale900}
              height={theme.sizing.scale900}
              backgroundColor={primitives.primary150}
              $style={{borderRadius: '50%'}}
              display='flex'
              alignItems='center'
              justifyContent='center'
            >
              <Label1 $style={{fontSize: '1.2em'}}>{letter}</Label1>
            </Block>

            <Block marginBottom={theme.sizing.scale800} marginRight={theme.sizing.scale400}/>
            <Block width='100%' $style={{borderBottomStyle: 'solid', borderBottomColor: theme.colors.mono500, borderBottomWidth: '2px'}}/>
          </Block>

          <FlexGrid
            flexGridColumnCount={[3, 3, 3, 4]}
            flexGridRowGap={theme.sizing.scale600}
            flexGridColumnGap={[theme.sizing.scale800, theme.sizing.scale800, theme.sizing.scale800, theme.sizing.scale600]}
          >
            {reducedList[letter].map(po =>
              <FlexGridItem key={po.id}>
                <RouteLink href={`${trimEnd(current_pathname, '/')}/${po.id}`}>
                  {po.name}
                </RouteLink>
              </FlexGridItem>
            )}
          </FlexGrid>

        </Block>
      )}
    </>
  )
}

export default ListView
