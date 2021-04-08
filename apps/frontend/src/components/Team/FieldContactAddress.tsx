import {StatefulSelect} from 'baseui/select'
import React, {ReactNode, useEffect, useState} from 'react'
import {Block} from 'baseui/block'
import {Notification} from 'baseui/notification'
import * as yup from 'yup'
import {Input} from 'baseui/input'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faEnvelope, faPlus, faUser} from '@fortawesome/free-solid-svg-icons'
import {FieldArray, FieldArrayRenderProps} from 'formik'
import {faSlackHash} from '@fortawesome/free-brands-svg-icons'
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'baseui/modal'
import {theme} from '../../util'
import Button from '../common/Button'
import {AddressType, ContactAddress, ProductTeamFormValues, SlackChannel, SlackUser} from '../../constants'
import {getSlackChannelById, getSlackUserByEmail, getSlackUserById, useSlackChannelSearch} from '../../api/ContactAddressApi'
import {ResourceOption, useResourceSearch} from '../../api'
import {user} from '../../services/User'
import {Spinner} from '../common/Spinner'
import {RenderTagList} from '../common/TagList'

export const ContactAddressesEdit = () => {
  const [addSlackChannel, setAddSlackChannel] = useState<boolean>(false)
  const [addSlackUser, setAddSlackUser] = useState<boolean>(false)
  const [addEmail, setAddEmail] = useState<boolean>(false)

  return (
    <FieldArray name='contactAddresses'>
      {(p: FieldArrayRenderProps) => {
        const addresses = (p.form.values as ProductTeamFormValues).contactAddresses
        const push = (v: ContactAddress) => {
          if (!addresses.find(v2 => v2.address === v.address))
            p.push(v)
        }
        return <>
          <Block>
            <Block marginBottom={theme.sizing.scale400}>
              <Button kind='secondary' size='compact' type='button' onClick={() => setAddSlackChannel(true)}>
                <span><FontAwesomeIcon icon={faSlackHash}/> Legg til slack-kanal</span>
              </Button>
              <Button kind='secondary' size='compact' marginLeft type='button' onClick={() => setAddSlackUser(true)}>
                <span><FontAwesomeIcon icon={faUser}/> Legg til slack-bruker</span>
              </Button>
              <Button kind='secondary' size='compact' marginLeft type='button' onClick={() => setAddEmail(true)}>
                <span><FontAwesomeIcon icon={faEnvelope}/> Legg til epost</span>
              </Button>
            </Block>
            <ContactAddressTagList remove={p.remove} addresses={addresses}/>
          </Block>

          <AddModal title='Legg til Slack kanal' isOpen={addSlackChannel} close={() => setAddSlackChannel(false)}>
            <SlackChannelSearch added={(p.form.values as ProductTeamFormValues).contactAddresses} add={push} close={() => setAddSlackChannel(false)}/>
          </AddModal>

          <AddModal title='Legg til Slack bruker' isOpen={addSlackUser} close={() => setAddSlackUser(false)}>
            <SlackUserSearch added={(p.form.values as ProductTeamFormValues).contactAddresses} add={push} close={() => setAddSlackUser(false)}/>
          </AddModal>

          <AddModal title='Legg til Epost adresse' isOpen={addEmail} close={() => setAddEmail(false)}>
            <AddEmail added={(p.form.values as ProductTeamFormValues).contactAddresses} add={push} close={() => setAddEmail(false)}/>
          </AddModal>

        </>
      }}
    </FieldArray>
  )
}

const AddModal = ({isOpen, close, title, children}: {isOpen: boolean, close: () => void, title: string, children: ReactNode}) =>
  <Modal unstable_ModalBackdropScroll isOpen={isOpen} onClose={close}>
    <ModalHeader>
      {title}
    </ModalHeader>
    <ModalBody>
      {children}
    </ModalBody>
    <ModalFooter>
      <Button kind='secondary' size='compact' type='button' onClick={close}>
        Avbryt
      </Button>
    </ModalFooter>
  </Modal>

export const ContactAddressTagList = ({addresses, remove}: {
  addresses: ContactAddress[],
  remove: (i: number) => void
}) => {
  const [slackChannels, setSlackChannels] = useState<SlackChannel[]>([])
  const [slackUsers, setSlackUsers] = useState<SlackUser[]>([])

  useEffect(() => {
    (async () => {
      const loadedChannels: SlackChannel[] = []
      const loadedUsers: SlackUser[] = []
      const channels = await Promise.all(
        addresses
        .filter(va => va.type === AddressType.SLACK)
        .filter(va => !slackChannels.find(sc => sc.id === va.address))
        .filter(va => {
          const vas = va as ContactAddress
          if (vas.slackChannel) {
            loadedChannels.push(vas.slackChannel)
            return false
          }
          return true
        })
        .map(c => getSlackChannelById(c.address))
      )

      const users = await Promise.all(
        addresses
        .filter(va => va.type === AddressType.SLACK_USER)
        .filter(va => !slackUsers.find(u => u.id === va.address))
        .filter(va => {
          const vas = va as ContactAddress
          if (vas.slackUser) {
            loadedUsers.push(vas.slackUser)
            return false
          }
          return true
        })
        .map(c => getSlackUserById(c.address))
      )

      setSlackChannels([...slackChannels, ...channels, ...loadedChannels])
      setSlackUsers([...slackUsers, ...users, ...loadedUsers])
    })()
  }, [addresses])

  return (
    <RenderTagList
      wide
      list={addresses.map((v, i) => {
          if (v.type === AddressType.SLACK) {
            const channel = slackChannels.find(c => c.id === v.address)
            return <Block key={i}>{channel ? slackChannelView(channel) : `Slack: ${v.address}`}</Block>
          } else if (v.type === AddressType.SLACK_USER) {
            const user = slackUsers.find(u => u.id === v.address)
            return <Block key={i}>{user ? `Slack: ${user.name}` : `Slack: ${v.address}`}</Block>
          }
          return <Block key={i}>Epost: {v.address}</Block>
        }
      )}
      onRemove={remove}
    />
  )
}


type AddContactAddressProps = {
  add: (v: ContactAddress) => void,
  added?: ContactAddress[],
  close?: () => void
}

export const SlackChannelSearch = ({added, add, close}: AddContactAddressProps) => {
  const [slackSearch, setSlackSearch, loading] = useSlackChannelSearch()

  return (
    <StatefulSelect
      placeholder={'Søk slack kanaler'}
      maxDropdownHeight='400px'
      filterOptions={o => o}
      searchable
      noResultsMsg='Ingen resultat'
      getOptionLabel={args => {
        const channel = args.option as SlackChannel
        return slackChannelView(channel, true)
      }}

      options={slackSearch.filter(ch => !added || !added.find(va => va.address === ch.id))}
      onChange={({value}) => {
        const channel = value[0] as SlackChannel
        if (channel) add({type: AddressType.SLACK, address: channel.id})
        close && close()
      }}
      onInputChange={event => setSlackSearch(event.currentTarget.value)}
      isLoading={loading}
    />
  )
}

export const SlackUserSearch = ({add, close}: AddContactAddressProps) => {
  const [slackSearch, setSlackSearch, loading] = useResourceSearch()
  const [error, setError] = useState('')
  const [loadingSlackId, setLoadingSlackId] = useState(false)

  const addEmail = (email: string) => {
    getSlackUserByEmail(email)
    .then(user => {
      add({type: AddressType.SLACK_USER, address: user.id})
      close && close()
    }).catch(e => {
      setError('Fant ikke slack for bruker')
      setLoadingSlackId(false)
    })
  }

  return (
    <Block display='flex' flexDirection='column'>
      <Block display='flex'>
        <StatefulSelect
          placeholder={'Søk slack brukere'}
          maxDropdownHeight='400px'
          filterOptions={o => o}
          searchable
          noResultsMsg='Ingen resultat'
          getOptionLabel={args => (args.option as ResourceOption).fullName}
          onFocus={() => setError('')}
          disabled={loadingSlackId}

          options={slackSearch}
          onChange={({value}) => {
            const resource = value[0] as ResourceOption
            if (resource) {
              setLoadingSlackId(true)
              addEmail(resource.email)
            }
          }}
          onInputChange={event => setSlackSearch(event.currentTarget.value)}
          isLoading={loading}
        />
        <Block>
          <Button type='button' onClick={() => addEmail(user.getEmail())} marginLeft>Meg </Button>
        </Block>
      </Block>
      {loadingSlackId && <Spinner size={theme.sizing.scale800}/>}
      {error && <Notification kind='negative' overrides={{Body: {style: {marginBottom: '-25px'}}}}>{error}</Notification>}
    </Block>
  )
}

const emailValidator = yup.string().email()

export const AddEmail = ({added, add: doAdd, close}: AddContactAddressProps) => {
  const [val, setVal] = useState('')
  const [error, setError] = useState('')
  const add = (address?: string) => {
    const toAdd = address || val
    if (!toAdd) return
    if (!added || !added.find(va => va.address === toAdd)) {
      if (!emailValidator.isValidSync(toAdd)) {
        setError('Ugyldig epostadress')
        return
      }
      doAdd({type: AddressType.EPOST, address: toAdd})
    }
    close && close()
  }
  const onKey = (e: React.KeyboardEvent) => (e.key === 'Enter') && add()
  return (
    <Block display='flex' flexDirection='column'>
      <Block display='flex'>
        <Input onKeyDown={onKey} value={val} onFocus={() => setError('')}
               onChange={e => setVal((e.target as HTMLInputElement).value)}
               onBlur={() => add()}
        />
        <Block display='flex' justifyContent='space-between'>
          <Button type='button' onClick={() => add(user.getEmail())} marginLeft>Meg </Button>
          <Button type='button' onClick={add} marginLeft><FontAwesomeIcon icon={faPlus}/> </Button>
        </Block>
      </Block>
      {error && <Notification kind='negative' overrides={{Body: {style: {marginBottom: '-25px'}}}}>
        {error}
      </Notification>
      }
    </Block>
  )
}

export const slackChannelView = (channel: SlackChannel, long?: boolean) => `Slack: #${channel.name} ${long ? channel.numMembers : ''}`
