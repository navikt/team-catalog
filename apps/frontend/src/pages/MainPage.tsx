import * as React from 'react'
import { useEffect, useState } from 'react'
import { Block } from 'baseui/block'
import ReactMarkdown from 'react-markdown/with-html'
import { getSettings, Settings } from '../components/admin/settings/SettingsApi'
import { DashboardPage } from '../components/dash/DashboardPage'
import { Card } from 'baseui/card'
import { Spinner } from 'baseui/spinner'

const MainPage = () => {
  const [settings, setSettings] = useState<Settings>()
  useEffect(() => {
    (async () => {
      setSettings(await getSettings())
    })()
  }, [])

  return (
    <Block display='flex' flexWrap>
      <Block width="100%" display="flex">
        <Block>
          <DashboardPage/>
        </Block>
        <Block width="30%">
          <Card>
            {!!settings && <ReactMarkdown source={settings?.frontpageMessage} escapeHtml={false}/>}
            {!settings && <Spinner/>}
          </Card>
        </Block>
      </Block>
    </Block>
  )
}

export default MainPage
