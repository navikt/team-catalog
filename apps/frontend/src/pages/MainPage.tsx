import * as React from 'react'
import { useEffect, useState } from 'react'
import { Block, BlockProps } from 'baseui/block'
import ReactMarkdown from 'react-markdown/with-html'
import { getSettings, Settings } from '../components/admin/settings/SettingsApi'
import { Dashboard } from '../components/dash/Dashboard'
import { Card } from 'baseui/card'
import { Spinner } from 'baseui/spinner'
import { cardShadow } from '../components/common/Style'

const contentProps: BlockProps = {
  width: "100%",
  display: ["block", "block", "block", "flex"],
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
      <Dashboard />
      <Block width={["100%", "100%", "100%", "30%"]}>
        <Card overrides={cardShadow}>
          {!!settings && <ReactMarkdown source={settings?.frontpageMessage} escapeHtml={false} />}
          {!settings && <Spinner />}
        </Card>
      </Block>
    </Block>
  )
}

export default MainPage
