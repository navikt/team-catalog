import { Location } from '../../constants'
import React, { useRef, useState } from 'react'
import { FloorPlan, useFloors } from '../../pages/LocationPage'
import { StatefulSelect } from 'baseui/select'
import { Block } from 'baseui/block'
import { FieldArrayRenderProps } from 'formik'
import { findIndex } from 'lodash'
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader } from 'baseui/modal'
import { ParagraphSmall } from 'baseui/typography'
import { Input } from 'baseui/input'
import { ModalLabel } from './ModalSchema'
import { theme } from '../../util'

export const FieldLocations = (props: { arrayHelper: FieldArrayRenderProps; locations: Location[] }) => {
  const floors = useFloors()
  const [floorId, setFloorId] = useState<string | undefined>(props.locations.length ? props.locations[0].floorId : undefined)

  const [nextIdPromise, setNextIdPromise] = React.useState<{ resolve: (v: string) => void; reject: () => void }>()
  const [idInput, setIdInput] = React.useState('')

  const ref = useRef<HTMLDivElement>(null)
  const floor = floors.find((f) => f.floorId === floorId)

  const indexForLocation = (id: string) => findIndex(props.locations, (l) => l.locationCode === id)
  const onAdd = (location: Location) => props.arrayHelper.push(location)
  const onDelete = (id: string) => props.arrayHelper.remove(indexForLocation(id))
  const onMove = (location: Location) => props.arrayHelper.replace(indexForLocation(location.locationCode), location)
  const nextId = async () => new Promise<string>((resolve, reject) => setNextIdPromise({ resolve, reject }))

  const cancelNew = () => {
    nextIdPromise?.reject()
    setIdInput('')
    setNextIdPromise(undefined)
  }
  const acceptNew = () => {
    nextIdPromise?.resolve(idInput)
    setIdInput('')
    setNextIdPromise(undefined)
  }

  return (
    <Block display={'flex'} flexDirection={'column'} width="100%" ref={ref}>
      <Block display="flex" marginBottom={theme.sizing.scale300}>
        <ModalLabel label="Lokasjon" />
        <StatefulSelect
          initialState={{ value: floorId ? [{ id: floorId }] : [] }}
          options={floors.map((f) => ({ id: f.floorId, label: f.name }))}
          onChange={(params) => setFloorId(params.value?.length ? (params.value[0].id as string) : undefined)}
        />
      </Block>

      {floor && (
        <FloorPlan floor={floor} width={ref.current?.clientWidth || 400} locations={props.locations} hideHeader onAdd={onAdd} onMove={onMove} onDelete={onDelete} nextId={nextId} />
      )}

      <Modal isOpen={!!nextIdPromise} onClose={cancelNew}>
        <ModalHeader>Velg områdekode</ModalHeader>
        <ModalBody>
          <ParagraphSmall>Velg områdekode for nytt område, feks A641</ParagraphSmall>
          <Input value={idInput} onChange={(e) => setIdInput((e.target as HTMLInputElement).value)} />
          <ModalFooter>
            <ModalButton kind={'tertiary'} onClick={cancelNew}>
              Avbryt
            </ModalButton>
            <ModalButton onClick={acceptNew} disabled={!idInput?.length}>
              Ok
            </ModalButton>
          </ModalFooter>
        </ModalBody>
      </Modal>
    </Block>
  )
}
