import * as React from 'react'
import { ReactElement, useEffect, useState } from 'react'
import { Select, TYPE, Value } from 'baseui/select'
import { theme } from '../../util'
import { useDebouncedState, useQueryParam } from '../../util/hooks'
import { prefixBiasedSort } from '../../util/sort'
import { getAllProductAreas, getAllTeams, getResourceOrUndefined, searchResource, searchTag } from '../../api'
import { Block } from 'baseui/block'
import { useHistory, useLocation } from 'react-router-dom'
import { urlForObject } from '../common/RouteLink'
import Button from '../common/Button'
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import { Radio, RadioGroup } from 'baseui/radio'
import { paddingZero } from '../common/Style'
import SearchLabel from './components/SearchLabel'
import { NavigableItem, ObjectType } from '../admin/audit/AuditTypes'
import { Cluster, LocationSimple, ProductArea, ProductTeam, Resource } from '../../constants'
import shortid from 'shortid'
import { getAllClusters } from '../../api/clusterApi'
import { searchResultColor } from '../../util/theme'
import { getLocationSimple } from '../../api/location'

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@')

type SearchItem = { id: string; sortKey: string; label: ReactElement; type: NavigableItem }

type SearchType = 'all' | ObjectType.Team | ObjectType.ProductArea | ObjectType.Cluster | ObjectType.Resource | ObjectType.Tag | ObjectType.Location

type RadioProps = {
  $isHovered: boolean
  $checked: boolean
}

const responsiveWidth = ['300px', '400px', '400px', '600px']

const SmallRadio = (value: SearchType, label: string) => {
  return (
    <Radio
      value={value}
      overrides={{
        Root: {
          style: {
            marginBottom: 0,
          },
        },
        Label: {
          style: (a: RadioProps) => ({
            ...paddingZero,
            ...(a.$isHovered ? { color: theme.colors.positive400 } : {}),
          }),
        },
        RadioMarkOuter: {
          style: (a: RadioProps) => ({
            width: theme.sizing.scale500,
            height: theme.sizing.scale500,
            ...(a.$isHovered ? { backgroundColor: theme.colors.positive400 } : {}),
          }),
        },
        RadioMarkInner: {
          style: (a: RadioProps) => ({
            width: a.$checked ? theme.sizing.scale100 : theme.sizing.scale300,
            height: a.$checked ? theme.sizing.scale100 : theme.sizing.scale300,
          }),
        },
      }}
    >
      <Block font="ParagraphXSmall">{label}</Block>
    </Radio>
  )
}

const SelectType = (props: { type: SearchType; setType: (type: SearchType) => void }) => (
  <Block
    font="ParagraphSmall"
    position="absolute"
    marginTop="-4px"
    backgroundColor={theme.colors.primary50}
    width={responsiveWidth}
    $style={{
      borderBottomLeftRadius: '8px',
      borderBottomRightRadius: '8px',
    }}
  >
    <Block marginLeft="3px" marginRight="3px" marginBottom="3px">
      <RadioGroup onChange={(e) => props.setType(e.target.value as SearchType)} align="horizontal" value={props.type}>
        {SmallRadio('all', 'Alle')}
        {SmallRadio(ObjectType.Team, 'Team')}
        {SmallRadio(ObjectType.ProductArea, 'Område')}
        {SmallRadio(ObjectType.Resource, 'Person')}
        {SmallRadio(ObjectType.Tag, 'Tagg')}
        {SmallRadio(ObjectType.Location, 'Lokasjon')}
      </RadioGroup>
    </Block>
  </Block>
)

const teamMap = (t: ProductTeam) => ({
  id: t.id,
  sortKey: t.name,
  label: <SearchLabel name={t.name} type={'Team'} backgroundColor={searchResultColor.teamBackground} />,
  type: ObjectType.Team,
})

const productAreaMap = (pa: ProductArea) => {
  return {
    id: pa.id,
    sortKey: pa.name,
    label: <SearchLabel name={pa.name} type={'Område'} backgroundColor={searchResultColor.productAreaBackground} />,
    type: ObjectType.ProductArea,
  }
}

const clusterMap = (cl: Cluster) => {
  return {
    id: cl.id,
    sortKey: cl.name,
    label: <SearchLabel name={cl.name} type={'Klynge'} backgroundColor={searchResultColor.clusterBackground} />,
    type: ObjectType.Cluster,
  }
}

const resourceMapSingle = (r?: Resource) => {
  return r ? [resourceMap(r)] : []
}

const resourceMap = (r: Resource) => {
  return {
    id: r.navIdent,
    sortKey: r.fullName,
    label: <SearchLabel name={r.fullName!} type={'Person'} backgroundColor={searchResultColor.resourceBackground} />,
    type: ObjectType.Resource,
  }
}

const tagMap = (tag: string) => {
  return {
    id: tag + '_' + shortid.generate(),
    sortKey: tag,
    label: <SearchLabel name={tag} type={'Tagg'} backgroundColor={searchResultColor.tagBackground} />,
    type: ObjectType.Tag,
  }
}

const locationMap = (lo: LocationSimple) => {
  return {
    id: lo.code,
    sortKey: lo.displayName,
    label: <SearchLabel name={lo.displayName} type={'Lokasjon'} backgroundColor={searchResultColor.locationBackground} />,
    type: ObjectType.Location,
  }
}

const order = (type: ObjectType) => {
  switch (type) {
    case ObjectType.Team:
      return 0
    case ObjectType.ProductArea:
      return 1
    case ObjectType.Cluster:
      return 2
    case ObjectType.Resource:
      return 3
    case ObjectType.Tag:
      return 4
    case ObjectType.Location:
      return 5
  }
  return -1
}

const useMainSearch = (searchParam?: string) => {
  const [search, setSearch] = useDebouncedState<string>(searchParam || '', 500)
  const [searchResult, setSearchResult] = React.useState<SearchItem[]>([])
  const [loading, setLoading] = React.useState<boolean>(false)
  const [type, setType] = useState<SearchType>('all')

  useEffect(() => {
    setSearchResult([])
    if (search && search.replace(/ /g, '').length > 2) {
      ;(async () => {
        let results: SearchItem[] = []
        let searches: Promise<any>[] = []
        const compareFn = (a: SearchItem, b: SearchItem) => prefixBiasedSort(search, a.sortKey, b.sortKey)
        const add = (items: SearchItem[]) => {
          results = [...results, ...items]
          results = results
            .filter((item, index, self) => index === self.findIndex((searchItem) => searchItem.id === item.id))
            .sort((a, b) => {
              // let backend handle resource search order
              const resources = a.type === ObjectType.Resource && b.type === ObjectType.Resource
              const typeOrder = order(a.type) - order(b.type)
              return resources || typeOrder !== 0 ? typeOrder : compareFn(a, b)
            })
          setSearchResult(results)
        }
        setLoading(true)

        const regExp = new RegExp(search, 'i')
        if (type === 'all' || type === ObjectType.Team) {
          searches.push(
            (async () => {
              add(
                (await getAllTeams('active')).content
                  .filter(
                    (t) =>
                      t.name.match(regExp) ||
                      t.description.match(regExp) ||
                      t.tags.filter((tt) => tt.match(regExp)).length > 0 ||
                      t.naisTeams.filter((nt) => nt.match(regExp)).length > 0
                  )
                  .map(teamMap)
              )
            })()
          )
        }

        if (type === 'all' || type === ObjectType.ProductArea) {
          searches.push(
            (async () => {
              add(
                (await getAllProductAreas('active')).content
                  .filter((pa) => pa.name.match(regExp) || pa.description.match(regExp) || pa.tags.filter((pat) => pat.match(regExp)).length > 0)
                  .map(productAreaMap)
              )
            })()
          )
        }

        if (type === 'all' || type === ObjectType.Cluster) {
          searches.push(
            (async () => {
              add(
                (await getAllClusters('active')).content
                  .filter((cl) => cl.name.match(regExp) || cl.description.match(regExp) || cl.tags.filter((pat) => pat.match(regExp)).length > 0)
                  .map(clusterMap)
              )
            })()
          )
        }

        if (type === 'all' || type === ObjectType.Resource) {
          if (search.match(/[a-zA-Z][0-9]{6}/)) searches.push((async () => add(resourceMapSingle(await getResourceOrUndefined(search))))())
          else searches.push((async () => add((await searchResource(search)).content.map(resourceMap)))())
        }

        if (type === 'all' || type === ObjectType.Tag) {
          searches.push(
            (async () => {
              add((await searchTag(search)).content.map(tagMap))
            })()
          )
        }

        if (type === 'all' || type === ObjectType.Location) {
          searches.push(
            (async () => {
              add((await getLocationSimple()).filter((lo) => lo.displayName.match(regExp) || lo.description.match(regExp)).map(locationMap))
            })()
          )
        }

        await Promise.all(searches)
        setLoading(false)
      })()
    }
  }, [search, type])
  return [setSearch, searchResult, loading, type, setType] as [(text: string) => void, SearchItem[], boolean, SearchType, (type: SearchType) => void]
}

const cleanSearch = (searchTerm: string) => {
  const stTrim = searchTerm.replace(/ /g, '')
  if (stTrim.length && stTrim.toLowerCase().startsWith('team') && stTrim.length >= 4 + 3) {
    return searchTerm.substr(4).trim()
  }
  return searchTerm
}

const MainSearch = () => {
  const searchParam = useQueryParam('search')
  const [setSearch, searchResult, loading, type, setType] = useMainSearch(searchParam)
  const [filter, setFilter] = useState(false)
  const [value, setValue] = useState<Value>(searchParam ? [{ id: searchParam, label: searchParam }] : [])
  const history = useHistory()
  const location = useLocation()

  return (
    <Block>
      <Block display="flex" position="relative" alignItems="center" width={responsiveWidth}>
        <Select
          backspaceRemoves
          startOpen={!!searchParam}
          noResultsMsg={'Ingen'}
          autoFocus={location.pathname === '/'}
          isLoading={loading}
          maxDropdownHeight="400px"
          searchable={true}
          type={TYPE.search}
          options={searchResult}
          placeholder={'Søk etter team, område, personer eller tagg'}
          value={value}
          onInputChange={(event) => {
            setSearch(cleanSearch(event.currentTarget.value))
            setValue([{ id: event.currentTarget.value, label: event.currentTarget.value }])
          }}
          onChange={(params) => {
            const item = params.value[0] as SearchItem
            ;(async () => {
              if (item) {
                history.push(urlForObject(item.type, item.id))
              } else {
                setValue([])
              }
            })()
          }}
          filterOptions={(options) => options}
          overrides={{
            SearchIcon: {
              style: {
                width: theme.sizing.scale900,
                height: theme.sizing.scale900,
                left: theme.sizing.scale400,
                top: theme.sizing.scale400,
              },
            },
            ControlContainer: {
              style: {
                ...(filter ? { borderBottomLeftRadius: 0 } : {}),
                ...(filter ? { borderBottomRightRadius: 0 } : {}),
              },
            },
            DropdownListItem: {
              style: {
                paddingTop: 0,
                paddingRight: '5px',
                paddingBottom: 0,
                paddingLeft: '5px',
              },
            },
          }}
        />
        <Button
          onClick={() => setFilter(!filter)}
          icon={faFilter}
          size="compact"
          kind={filter ? 'primary' : 'tertiary'}
          marginLeft
          $style={{ height: theme.sizing.scale1000, width: theme.sizing.scale1000 }}
        />
      </Block>
      {filter && <SelectType type={type} setType={setType} />}
    </Block>
  )
}

export default MainSearch
