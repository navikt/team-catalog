import * as React from 'react'
import { ReactElement, useEffect, useState } from 'react'
import { Select, TYPE, Value } from 'baseui/select'
import { theme } from '../../util';
import { useDebouncedState } from "../../util/hooks";
import { prefixBiasedSort } from "../../util/sort";
import { getAllTeams } from "../../api/teamApi";
import { Block } from "baseui/block";
import { getAllProductAreas } from "../../api";
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { urlForObject } from "../common/RouteLink";
import Button from "../common/Button";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { Radio, RadioGroup } from "baseui/radio";
import { paddingZero } from "../common/Style";
import SearchLabel from "./components/SearchLabel";
import { NavigableItem, ObjectType } from "../admin/audit/AuditTypes";
import { searchResource } from "../../api/resourceApi";
import { ProductArea, ProductTeam, Resource } from '../../constants'

type SearchItem = { id: string, sortKey: string, label: ReactElement, type: NavigableItem }

type SearchType = 'all' | ObjectType.Team | ObjectType.ProductArea | ObjectType.Resource

type RadioProps = {
  $isHovered: boolean
  $checked: boolean
}

const responsiveWidth = ['300px', '400px', '400px', '600px']

const SmallRadio = (value: SearchType, label: string) => {
  return (
    <Radio value={value}
           overrides={{
             Root: {
               style: {
                 marginBottom: 0
               }
             },
             Label: {
               style: (a: RadioProps) => ({
                 ...paddingZero,
                 ...(a.$isHovered ? {color: theme.colors.positive400} : {}),
               })
             },
             RadioMarkOuter: {
               style: (a: RadioProps) => ({
                 width: theme.sizing.scale500,
                 height: theme.sizing.scale500,
                 ...(a.$isHovered ? {backgroundColor: theme.colors.positive400} : {})
               })
             },
             RadioMarkInner: {
               style: (a: RadioProps) => ({
                 width: a.$checked ? theme.sizing.scale100 : theme.sizing.scale300,
                 height: a.$checked ? theme.sizing.scale100 : theme.sizing.scale300,
               })
             }
           }}
    >
      <Block font='ParagraphXSmall'>{label}</Block>
    </Radio>
  )
}

const SelectType = (props: { type: SearchType, setType: (type: SearchType) => void }) =>
  <Block
    font='ParagraphSmall'
    position='absolute'
    marginTop='-4px'
    backgroundColor={theme.colors.primary50}
    width={responsiveWidth}
    $style={{
      borderBottomLeftRadius: '8px',
      borderBottomRightRadius: '8px'
    }}>
    <Block
      marginLeft='3px'
      marginRight='3px'
      marginBottom='3px'
    >
      <RadioGroup
        onChange={e => props.setType(e.target.value as SearchType)}
        align='horizontal'
        value={props.type}

      >
        {SmallRadio('all', 'Alle')}
        {SmallRadio(ObjectType.Team, 'Team')}
        {SmallRadio(ObjectType.ProductArea, 'Område')}
        {SmallRadio(ObjectType.Resource, 'Person')}
      </RadioGroup>
    </Block>
  </Block>

const teamMap = (t: ProductTeam) => ({
  id: t.id,
  sortKey: t.name,
  label: <SearchLabel name={t.name} type={"Team"}/>,
  type: ObjectType.Team
})

const productAreaMap = (pa: ProductArea) => {
  return ({
    id: pa.id,
    sortKey: pa.name,
    label: <SearchLabel name={pa.name} type={"Område"}/>,
    type: ObjectType.ProductArea
  })
}
const resourceMap = (r: Resource) => {
  return ({
    id: r.navIdent,
    sortKey: r.fullName,
    label: <SearchLabel name={r.fullName} type={"Person"}/>,
    type: ObjectType.Resource
  })
}

const order = (type: ObjectType) => {
  switch (type) {
    case ObjectType.Team:
      return 0;
    case ObjectType.ProductArea:
      return 1
    case ObjectType.Resource:
      return 2
  }
  return -1
}

const useMainSearch = () => {
  const [search, setSearch] = useDebouncedState<string>('', 500)
  const [searchResult, setSearchResult] = React.useState<SearchItem[]>([])
  const [loading, setLoading] = React.useState<boolean>(false)
  const [type, setType] = useState<SearchType>('all')

  useEffect(() => {
    setSearchResult([])
    if (search && search.replace(/ /g, '').length > 2) {
      (async () => {
        let results: SearchItem[] = []
        let searches: Promise<any>[] = []
        const compareFn = (a: SearchItem, b: SearchItem) => prefixBiasedSort(search, a.sortKey, b.sortKey)
        const add = (items: SearchItem[]) => {
          results = [...results, ...items]
          results = results.filter((item, index, self) =>
            index === self.findIndex((searchItem) => (
              searchItem.id === item.id
            ))
          ).sort((a, b) => {
            const typeOrder = order(a.type) - order(b.type)
            return typeOrder !== 0 ? typeOrder : compareFn(a, b)
          })
          setSearchResult(results)
        }
        setLoading(true)

        const regExp = new RegExp(search, "i")
        if (type === 'all' || type === ObjectType.Team) {
          searches.push((async () => {
            add((await getAllTeams()).content
            .filter(t =>
              t.name.match(regExp) ||
              t.description.match(regExp) ||
              t.tags.filter(tt => tt.match(regExp)).length > 0)
            .map(teamMap))
          })())
        }

        if (type === 'all' || type === ObjectType.ProductArea) {
          searches.push((async () => {
            add((await getAllProductAreas()).content
            .filter(pa =>
              pa.name.match(regExp) ||
              pa.description.match(regExp) ||
              pa.tags.filter(pat => pat.match(regExp)).length > 0)
            .map(productAreaMap))
          })())
        }

        if (type === 'all' || type === ObjectType.Resource) {
          searches.push((async () => {
            add((await searchResource(search)).content.map(resourceMap))
          })())
        }

        await Promise.all(searches)
        setLoading(false)
      })()
    }
  }, [search, type])
  return [setSearch, searchResult, loading, type, setType] as [(text: string) => void, SearchItem[], boolean, SearchType, (type: SearchType) => void]
}


const MainSearch = (props: RouteComponentProps) => {
  const [setSearch, searchResult, loading, type, setType] = useMainSearch()
  const [filter, setFilter] = useState(false)
  const [value, setValue] = useState<Value>()

  return (
    <Block>
      <Block display='flex'
             position='relative'
             alignItems='center'
             width={responsiveWidth}
      >
        <Select
          noResultsMsg={"Ingen"}
          autoFocus={props.match.path === '/'}
          isLoading={loading}
          maxDropdownHeight="400px"
          searchable={true}
          type={TYPE.search}
          options={searchResult}
          placeholder={"Søk etter team, område eller personer"}
          value={value}
          onInputChange={event => {
            setSearch(event.currentTarget.value)
            setValue([{id: event.currentTarget.value, label: event.currentTarget.value}])
          }}
          onChange={(params) => {
            const item = params.value[0] as SearchItem;
            (async () => {
              if (item) {
                props.history.push(urlForObject(item.type, item.id))
              } else {
                setValue([])
              }
            })()
          }}
          filterOptions={options => options}
          overrides={{
            SearchIcon: {
              style: {
                width: theme.sizing.scale900,
                height: theme.sizing.scale900,
                left: theme.sizing.scale400,
                top: theme.sizing.scale400
              }
            },
            ControlContainer: {
              style: {
                ...(filter ? {borderBottomLeftRadius: 0} : {}),
                ...(filter ? {borderBottomRightRadius: 0} : {})
              }
            },
          }
          }
        />
        <Button onClick={() => setFilter(!filter)} icon={faFilter} size='compact' kind={filter ? 'primary' : 'tertiary'} marginLeft
                $style={{height: theme.sizing.scale1000, width: theme.sizing.scale1000}}/>
      </Block>
      {filter && <SelectType type={type} setType={setType}/>}
    </Block>
  )
}

export default withRouter(MainSearch)
