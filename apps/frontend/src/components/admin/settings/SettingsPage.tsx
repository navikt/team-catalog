import React, {FormEvent, useEffect, useState} from "react"
import {Block} from "baseui/block"
import {StyledSpinnerNext} from "baseui/spinner"
import {H4, Label2, ParagraphMedium} from "baseui/typography"
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
import {forceSync} from '../../../api'
import {Spinner} from '../../common/Spinner'
import {Checkbox, LABEL_PLACEMENT} from 'baseui/checkbox'

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
      } catch (e: any) {
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

      <AndreOperasjoner/>
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

const AndreOperasjoner = () => {
  const [error, setError] = useState()
  const [loading, setLoading] = useState(false)
  const [fullSync, setFullSync] = useState(true)
  const resetSync = async () => {
    setLoading(true)
    forceSync(fullSync).catch(e => setError(e?.message)).then(() => setLoading(false))
  }

  return (
    <Block marginTop={'100px'}>
      <H4>Andre operasjoner</H4>
      <Block>
        {loading && <Block margin={theme.sizing.scale600}><Spinner size={theme.sizing.scale1200}/></Block>}
        <Block display={'flex'}>
          <Button marginRight type={'button'} onClick={resetSync} disabled={loading}>Reset sync</Button>
          <Checkbox checked={fullSync} onChange={() => setFullSync(!fullSync)}
                    labelPlacement={LABEL_PLACEMENT.right}
          >Full rekjøring av alt</Checkbox>
        </Block>
        <ParagraphMedium>Vil sende alle objekter på kafka og til datakatalogen på ny, dette kan ta endel tid.</ParagraphMedium>
      </Block>
    </Block>
  )
}
