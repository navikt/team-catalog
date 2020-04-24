import * as React from 'react'
import {ReactElement, useEffect, useState} from 'react'
import {Select, TYPE, Value} from 'baseui/select'
import {theme} from '../../util';
import {useDebouncedState} from "../../util/hooks";
import {prefixBiasedSort} from "../../util/sort";
import {searchTeam} from "../../api/teamApi";
import {Block} from "baseui/block";
import {searchProductArea} from "../../api";
import {RouteComponentProps, withRouter} from 'react-router-dom';
import {urlForObject} from "../common/RouteLink";
import Button from "../common/Button";
import {faFilter} from "@fortawesome/free-solid-svg-icons";
import {Radio, RadioGroup} from "baseui/radio";
import {paddingZero} from "../common/Style";
import SearchLabel from "./components/SearchLabel";
import {NavigableItem, ObjectType} from "../admin/audit/AuditTypes";
import {searchResource} from "../../api/resourceApi";

type SearchItem = { id: string, sortKey: string, label: ReactElement, type: NavigableItem }

type SearchType = 'all' | ObjectType.Team | ObjectType.ProductArea | ObjectType.Resource

type RadioProps = {
  $isHovered: boolean
  $checked: boolean
}

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
    width='600px'
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
        {SmallRadio(ObjectType.ProductArea, 'Produktområde')}
        {SmallRadio(ObjectType.Resource, 'Medlemmer')}
      </RadioGroup>
    </Block>
  </Block>

const useMainSearch = () => {
  const [search, setSearch] = useDebouncedState<string>('', 500)
  const [searchResult, setSearchResult] = React.useState<SearchItem[]>([])
  const [loading, setLoading] = React.useState<boolean>(false)
  const [type, setType] = useState<SearchType>('all')

  useEffect(() => {
    setSearchResult([])
    if (search && search.length > 2) {
      (async () => {
        let results: SearchItem[] = []
        const compareFn = (a: SearchItem, b: SearchItem) => prefixBiasedSort(search, a.sortKey, b.sortKey)
        const add = (items: SearchItem[]) => {
          results = [...results, ...items].sort(compareFn)
          setSearchResult(results)
        }
        setLoading(true)

        if (type === 'all' || type === ObjectType.Team) {
          const responseSearchTeam = await searchTeam(search)
          add(responseSearchTeam.content.map(t => ({
            id: t.id,
            sortKey: t.name,
            label: <SearchLabel name={t.name} type={"Team"}/>,
            type: ObjectType.Team
          })))
        }

        if (type === 'all' || type === ObjectType.ProductArea) {
          const responseProductAreaSearch = await searchProductArea(search)
          add(responseProductAreaSearch.content.map(pa => {
            return ({
              id: pa.id,
              sortKey: pa.name,
              label: <SearchLabel name={pa.name} type={"Produktområde"}/>,
              type: ObjectType.ProductArea
            })
          }))
        }

        if (type === 'all' || type === ObjectType.Resource) {
          const resourceResponse = await searchResource(search)
          console.log(resourceResponse)
          if (resourceResponse.content.length > 0) {
            add(resourceResponse.content.map(pa => {
              return ({
                id: pa.navIdent,
                sortKey: pa.fullName,
                label: <SearchLabel name={pa.fullName} type={"Person"}/>,
                type: ObjectType.Resource
              })
            }))
          }
        }

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
             alignItems='center'>
        <Select
          noResultsMsg={"Ingen"}
          autoFocus={props.match.path === '/'}
          isLoading={loading}
          maxDropdownHeight="400px"
          searchable={true}
          type={TYPE.search}
          options={searchResult}
          placeholder={"Søk etter team, produktområde eller personer"}
          value={value}
          onInputChange={event => {
            console.log(event.currentTarget.value)
            setSearch(event.currentTarget.value)
            setValue([{id: event.currentTarget.value, label: event.currentTarget.value}])
          }}
          onChange={(params) => {
            console.log(params)
            const item = params.value[0] as SearchItem;
            (async () => {
              if (item) {
                props.history.push(await urlForObject(item.type, item.id))
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
            Root: {
              style: {
                width: '600px',
              }
            }
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
