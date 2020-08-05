import * as React from 'react'
import {useEffect, useState} from 'react'
import {Block, BlockProps} from 'baseui/block'
import ReactMarkdown from 'react-markdown/with-html'
import {getSettings, Settings} from '../components/admin/settings/SettingsApi'
import {Dashboard} from '../components/dash/Dashboard'
import {Card} from 'baseui/card'
import {cardShadow} from '../components/common/Style'
import {theme} from '../util'
import {Spinner} from '../components/common/Spinner'
import {getAllTeams} from '../api'
import {ProductTeam} from '../constants'
import {ListItemLabel} from 'baseui/list/index'
import moment from 'moment'
import {HeadingSmall, LabelXSmall} from 'baseui/typography/index'
import RouteLink from '../components/common/RouteLink'
import {marginAll} from '../components/Style'

const contentProps: BlockProps = {
  width: "100%",
  display: 'flex',
  flexWrap: true,
  alignItems: "flex-start"
}

const MainPage = () => {
  return (
    <Block {...contentProps}>
      <Dashboard/>
      <MainPageMessage/>
      <RecentTeams/>
    </Block>
  )
}

const MainPageMessage = () => {
  const [settings, setSettings] = useState<Settings>()
  useEffect(() => {
    (async () => {
      setSettings(await getSettings())
    })()
  }, [])

  return (
    <>
      {!settings && <Block marginLeft={theme.sizing.scale1200}><Spinner size={theme.sizing.scale2400}/></Block>}
      {!!settings && <Block marginTop={theme.sizing.scale600}>
        <Card overrides={cardShadow}>
          <ReactMarkdown source={settings?.frontpageMessage} escapeHtml={false}/>
        </Card>
      </Block>}
    </>
  )
}

const RecentTeams = () => {
  const [teamList, setTeamList] = useState<ProductTeam[]>()

  useEffect(() => {
    getAllTeams().then(r => {
      const content = r.content
      content.sort((a, b) => moment(b.changeStamp.lastModifiedDate).valueOf() - moment(a.changeStamp.lastModifiedDate).valueOf())
      setTeamList(content.slice(0, 12))
    })
  }, [])

  if (!teamList) return null

  return (
    <Block>
      <HeadingSmall marginBottom={theme.sizing.scale600}>Sist endrede teams</HeadingSmall>
      <Block flexWrap display='flex' justifyContent='space-between' marginLeft={`-${theme.sizing.scale300}`}>
        {teamList.map(team =>
          <RouteLink key={team.id} href={`/team/${team.id}`}>
            <Card overrides={{
              Root: {
                style: {
                  ...cardShadow.Root.style,
                  width: '220px',
                  marginTop: theme.sizing.scale800,
                  marginLeft: theme.sizing.scale300
                }
              }, Contents: {
                style: {
                  ...marginAll(theme.sizing.scale400)
                }
              }
            }}>
              <Block display='flex' flexDirection='column' justifyContent='space-between' height='72px'>
                <ListItemLabel><span style={{wordBreak: 'break-word'}}>{team.name}</span></ListItemLabel>
                <LabelXSmall marginTop={theme.sizing.scale300}>Endret: {moment(team.changeStamp.lastModifiedDate).format('lll')}</LabelXSmall>
              </Block>
            </Card>
          </RouteLink>
        )}
      </Block>
    </Block>
  )
}

export default MainPage
