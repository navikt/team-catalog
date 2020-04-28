import * as React from 'react'
import { useEffect, useState } from 'react'
import startIll from '../resources/frontpage_ill.svg'
import { Block } from 'baseui/block'
import { theme } from '../util'
import ReactMarkdown from 'react-markdown/with-html'
import { getSettings, Settings } from '../components/admin/settings/SettingsApi'
import RouteLink from '../components/common/RouteLink'

const MainPage = () => {
  const [settings, setSettings] = useState<Settings>()
  const [isLoading, setLoading] = useState(true)
  useEffect(() => {
    (async () => {
      setSettings(await getSettings())
      setLoading(false)
    })()
  }, [])

  return (
    <Block display='flex' flexWrap>
      <Block width="100%" display="flex" justifyContent="space-between">
        {!isLoading &&
        <Block marginRight={theme.sizing.scale1200}>
          <ReactMarkdown source={settings?.frontpageMessage} escapeHtml={false}/>
        </Block>}
        <Block marginTop={theme.sizing.scale1200} display='flex' width='600px' flexWrap>
          <Block width='100%'>
            <RouteLink href='/dashboard'>Dashboard</RouteLink>
          </Block>
          <Block width='100%'>
            <img src={startIll} alt='Scrum Team' width='600px'/>
          </Block>
        </Block>
      </Block>
    </Block>
  )
}

export default MainPage
