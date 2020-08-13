import * as React from 'react'
import {useEffect, useState} from 'react'
import {Block, BlockProps} from 'baseui/block'
import ReactMarkdown from 'react-markdown/with-html'
import {getSettings, Settings} from '../components/admin/settings/SettingsApi'
import {Dashboard} from '../components/dash/Dashboard'
import {Card} from 'baseui/card'
import {cardShadow} from '../components/common/Style'
import {theme} from '../util'
import {getAllTeams} from '../api'
import {ProductTeam} from '../constants'
import {ListItemLabel} from 'baseui/list/index'
import moment from 'moment'
import {HeadingSmall, LabelXSmall} from 'baseui/typography/index'
import RouteLink from '../components/common/RouteLink'
import {marginAll} from '../components/Style'
import {Skeleton} from 'baseui/skeleton/index'

const contentProps: BlockProps = {
  width: "100%",
  display: 'flex',
  flexWrap: true,
  flexDirection: 'column'
}

const MainPage = () => {
  return (
    <Block {...contentProps}>
      <Dashboard/>
      <Block display='flex' flexWrap marginTop={theme.sizing.scale600}>
        <MainPageMessage/>
        <RecentTeams/>
      </Block>
    </Block>
  )
}

const MainPageMessage = () => {
  const [settings, setSettings] = useState<Settings>()
  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  return (
    <Block width='600px'>
      <HeadingSmall marginBottom={theme.sizing.scale900}>Dagens melding</HeadingSmall>
      <Card overrides={cardShadow}>
        <ReactMarkdown source={settings?.frontpageMessage} escapeHtml={false}/>
        {!settings && <Skeleton width='500px' rows={20} animation/>}
      </Card>
    </Block>
  )
}

const RecentTeams = () => {
  const [teamList, setTeamList] = useState<ProductTeam[]>()
  const numTeams = 10

  useEffect(() => {
    getAllTeams().then(r => {
      const content = r.content
      content.sort((a, b) => moment(b.changeStamp.lastModifiedDate).valueOf() - moment(a.changeStamp.lastModifiedDate).valueOf())
      setTeamList(content.slice(0, numTeams))
    })
  }, [])

  return (
    <Block marginLeft={theme.sizing.scale800}>
      <HeadingSmall marginBottom={theme.sizing.scale600}>Sist endrede teams</HeadingSmall>
      <Block display='flex' flexDirection='column'>
        {teamList && teamList.map(team =>
          <TeamCard>
            <RouteLink key={team.id} href={`/team/${team.id}`}>
              <ListItemLabel><span style={{wordBreak: 'break-word'}}>{team.name}</span></ListItemLabel>
            </RouteLink>
            <LabelXSmall marginTop={theme.sizing.scale300}>Endret: {moment(team.changeStamp.lastModifiedDate).format('lll')}</LabelXSmall>
          </TeamCard>
        )}
        {!teamList && Array.from(Array(numTeams).keys()).map(i =>
          <TeamCard><Skeleton key={i} width='100%' rows={2} animation/></TeamCard>
        )}
      </Block>
    </Block>
  )
}

const TeamCard = (props: {children: React.ReactNode}) => (
  <Card overrides={{
    Root: {
      style: {
        ...cardShadow.Root.style,
        width: '220px',
        marginTop: theme.sizing.scale600,
      }
    }, Contents: {
      style: {
        ...marginAll(theme.sizing.scale400)
      }
    }
  }}>
    <Block display='flex' flexDirection='column'>
      {props.children}
    </Block>
  </Card>
)

export default MainPage
