import {Location} from '../../constants'
import React, {useState} from 'react'
import {FloorPlan, useFloors} from '../../pages/LocationPage'
import {StatefulSelect} from 'baseui/select/index'
import {Block} from 'baseui/block/index'
import {FieldArrayRenderProps} from 'formik'
import {findIndex} from 'lodash'

export const FieldLocations = (props: {arrayHelper: FieldArrayRenderProps, locations: Location[]}) => {
  const floors = useFloors()
  const [floorId, setFloorId] = useState<string | undefined>(props.locations.length ? props.locations[0].floorId : undefined)
  const width = window.innerWidth * .45
  const floor = floors.find(f => f.floorId === floorId)

  const onAdd = (location: Location) => {
    props.arrayHelper.push(location)
  }
  const onMove = (location: Location) => {
    const id = findIndex(props.locations, l => l.locationCode === location.locationCode)
    props.arrayHelper.replace(id, location)
  }

  return (
    <Block display={'flex'} flexDirection={'column'} width='100%'>
      <span>{props.locations.length}</span>
      <StatefulSelect
        initialState={{value: floorId ? [{id: floorId}] : []}}
        options={floors.map(f => ({id: f.floorId, label: f.name}))}
        onChange={params => setFloorId(params.value?.length ? params.value[0].id as string : undefined)}
      />
      {floor && <FloorPlan floor={floor} width={width} locations={props.locations} onAdd={onAdd} onMove={onMove}/>}
    </Block>
  )
}
