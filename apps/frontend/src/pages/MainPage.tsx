import * as React from 'react'
import { useEffect, useState } from 'react'
import { Block, BlockProps } from 'baseui/block'
import ReactMarkdown from 'react-markdown/with-html'
import { getSettings, Settings } from '../components/admin/settings/SettingsApi'
import { Dashboard } from '../components/dash/Dashboard'
import { Card } from 'baseui/card'
import { cardShadow } from '../components/common/Style'
import { theme } from '../util'
import { Spinner } from '../components/common/Spinner'

const contentProps: BlockProps = {
  width: "100%",
  display: 'flex',
  flexWrap: true,
  alignItems: "flex-start"
}

const MainPage = () => {
  const [settings, setSettings] = useState<Settings>()
  useEffect(() => {
    (async () => {
      setSettings(await getSettings())
    })()
  }, [])

  return (
    <Block {...contentProps}>
      <Dashboard/>
      {!settings && <Block marginLeft={theme.sizing.scale1200}><Spinner size={theme.sizing.scale2400}/></Block>}
      {!!settings && <Block marginTop={theme.sizing.scale600}>
        <Card overrides={cardShadow}>
          <ReactMarkdown source={settings?.frontpageMessage} escapeHtml={false}/>
        </Card>
      </Block>}
    </Block>
  )
}

export default MainPage
