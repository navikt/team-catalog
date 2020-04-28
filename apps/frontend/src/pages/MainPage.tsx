import * as React from 'react'
import { useEffect, useState } from 'react'
import startIll from '../resources/frontpage_ill.svg'
import { Block } from 'baseui/block'
import { theme } from '../util'
import ReactMarkdown from 'react-markdown/with-html'
import { getSettings, Settings } from '../components/admin/settings/SettingsApi'
import RouteLink from '../components/common/RouteLink'
import { DashboardPage } from '../components/dash/DashboardPage'
import { Card } from 'baseui/card'

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
        <Block width='70%'>
          <DashboardPage />
        </Block>
        {!isLoading &&
          <Block width="30%">
            <Card>
              <ReactMarkdown source={settings?.frontpageMessage} escapeHtml={false} />

            </Card>
          </Block>}

      </Block>
    </Block>
  )
}

export default MainPage
