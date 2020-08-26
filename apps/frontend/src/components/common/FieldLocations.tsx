import {Location} from '../../constants'
import React, {useState} from 'react'
import {FloorPlan, useFloors} from '../../pages/LocationPage'
import {StatefulSelect} from 'baseui/select'
import {Block} from 'baseui/block'
import {FieldArrayRenderProps} from 'formik'
import {findIndex} from 'lodash'
import {Modal, ModalBody, ModalButton, ModalFooter, ModalHeader} from 'baseui/modal'
import {Paragraph3} from 'baseui/typography'
import {Input} from 'baseui/input'

const getId = (locations: Location[], id: string) =>
  findIndex(locations, l => l.locationCode === id)

export const FieldLocations = (props: {arrayHelper: FieldArrayRenderProps, locations: Location[]}) => {
  const floors = useFloors()
  const [floorId, setFloorId] = useState<string | undefined>(props.locations.length ? props.locations[0].floorId : undefined)
  const width = window.innerWidth * .45
  const floor = floors.find(f => f.floorId === floorId)

  console.log(JSON.stringify(props.locations, null, 2))

  const onAdd = (location: Location) => {
    props.arrayHelper.push(location)
  }
  const onDelete = (id: string) => {
    props.arrayHelper.remove(getId(props.locations, id))
  }
  const onMove = (location: Location) => {
    props.arrayHelper.replace(getId(props.locations, location.locationCode), location)
  }

  const nextId = async () => {
    return new Promise<string>((resolve, reject) => setNextIdPromise({resolve, reject}))
  }

  const [nextIdPromise, setNextIdPromise] = React.useState<{resolve: (v: string) => void, reject: () => void}>();
  const [idInput, setIdInput] = React.useState('');


  return (
    <Block display={'flex'} flexDirection={'column'} width='100%'>
      <span>{props.locations.length}</span>
      <StatefulSelect
        initialState={{value: floorId ? [{id: floorId}] : []}}
        options={floors.map(f => ({id: f.floorId, label: f.name}))}
        onChange={params => setFloorId(params.value?.length ? params.value[0].id as string : undefined)}
      />
      {floor && <FloorPlan floor={floor} width={width} locations={props.locations}
                           onAdd={onAdd} onMove={onMove} onDelete={onDelete} nextId={nextId}/>}
      <Modal isOpen={!!nextIdPromise}>
        <ModalHeader>Velg områdekode</ModalHeader>
        <ModalBody>
          <Paragraph3>Velg områdekode for nytt område, feks A641</Paragraph3>
          <Input value={idInput} onChange={e => setIdInput((e.target as HTMLInputElement).value)}/>
          <ModalFooter>
            <ModalButton kind={'tertiary'} onClick={() => {
              nextIdPromise?.reject()
              setNextIdPromise(undefined)
            }}>Avbryt</ModalButton>
            <ModalButton onClick={() => {
              nextIdPromise?.resolve(idInput)
              setNextIdPromise(undefined)
            }}>Ok</ModalButton>
          </ModalFooter>
        </ModalBody>
      </Modal>
    </Block>
  )
}

type Executor<T> = (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void
