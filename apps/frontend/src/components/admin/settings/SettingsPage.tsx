import React, {FormEvent, useEffect, useState} from "react"
import {Block} from "baseui/block"
import {StyledSpinnerNext} from "baseui/spinner"
import {H4, Label2} from "baseui/typography"
import {StatefulTextarea} from "baseui/textarea"
import {getSettings, Settings, writeSettings} from './SettingsApi'
import {intl} from '../../../util/intl/intl'
import {theme} from '../../../util'
import Button from '../../common/Button'
import {Markdown} from '../../common/Markdown'
import {RenderTagList} from '../../common/TagList'
import {Input} from 'baseui/input'
import {StatefulTooltip} from 'baseui/tooltip'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExclamationCircle} from '@fortawesome/free-solid-svg-icons'
import {colors} from 'baseui/tokens'

export const SettingsPage = () => {
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = useState()
  const [settings, setSettings] = useState<Settings>()


  const load = async () => {
    setLoading(true)
    setSettings(await getSettings())
    setLoading(false)
  }

  const save = async () => {
    if (settings) {
      setLoading(true)
      try {
        setSettings(await writeSettings(settings))
      } catch (e) {
        setError(e)
      }
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <Block>
      <H4>{intl.settings}</H4>
      {loading ? <StyledSpinnerNext size={40}/> :
        error || !settings ? {error} :
          <Block>
            <FrontpageMessage message={settings?.frontpageMessage} setMessage={frontpageMessage => setSettings({...settings, frontpageMessage})}/>
            <IdentFilter idents={settings?.identFilter} setIdents={identFilter => setSettings({...settings, identFilter})}/>
            <Block display="flex" justifyContent="flex-end" marginTop={theme.sizing.scale800}>
              <Button type="button" kind="secondary" marginRight onClick={load}>{intl.abort}</Button>
              <Button type="button" onClick={save}>{intl.save}</Button>
            </Block>
          </Block>}
    </Block>
  )
}

const FrontpageMessage = (props: {message?: string, setMessage: (message: string) => void}) => {
  return (
    <>
      <Block alignItems="center" marginTop="1rem">
        <Label2 marginRight="1rem" marginBottom='1rem'>Forsidemelding</Label2>
        <Block width="100%" display="flex">
          <Block width="50%" marginRight="1rem">
            <StatefulTextarea initialState={{value: props.message}} rows={20}
                              onChange={(event: any) => props.setMessage((event as FormEvent<HTMLInputElement>).currentTarget.value)}
            />
          </Block>
          <Block width="50%">
            <Markdown source={props.message || ''} escapeHtml={false}/>
          </Block>
        </Block>
      </Block>
    </>
  )
}

const IdentFilter = (props: {idents: string[], setIdents: (idents: string[]) => void}) => {
  const [val, setVal] = useState('')
  const add = () => {
    if (val) {
      if (props.idents.indexOf(val) < 0) {
        props.setIdents([...props.idents, val])
      }
      setVal('')
    }
  }
  const onKey = (e: React.KeyboardEvent) => (e.key === 'Enter') && add()
  return (
    <Block marginTop={theme.sizing.scale2400}>
      <Block width={'100%'}>
        <Label2 marginRight="1rem" marginBottom='1rem'>
          Filtrerte identer
          <StatefulTooltip
            content={
              <Block>Disse identene vil filtreres bort i all visning i katalogen. Kan skyldes ulike spesielle omstendigheter som f.eks. at personen nylig døde.</Block>}>
            <span> <FontAwesomeIcon icon={faExclamationCircle} color={colors.blue300}/></span>
          </StatefulTooltip>
        </Label2>
        <Input
          value={val}
          onChange={e => setVal(e.currentTarget.value)}
          onKeyDown={onKey} onBlur={add}
          placeholder="Ident"
        />
      </Block>
      <Block>
        <RenderTagList list={props.idents} onRemove={(index: number) => {
          const newIdents = [...props.idents]
          newIdents.splice(index, 1)
          props.setIdents(newIdents)
        }}/>
      </Block>
    </Block>
  )
}
