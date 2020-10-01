import React, {useEffect, useState} from 'react'
import axios from 'axios'
import {PageResponse} from '../constants'
import {env} from '../util/env'
import {Block} from 'baseui/block'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faBell} from '@fortawesome/free-regular-svg-icons'
import {faBell as faBellSolid, faEnvelope} from '@fortawesome/free-solid-svg-icons'
import {faSlack} from '@fortawesome/free-brands-svg-icons'
import {theme} from '../util'
import {StatefulPopover} from 'baseui/popover'
import Button from '../components/common/Button'
import {user} from './User'
import {Card} from 'baseui/card'
import RouteLink from '../components/common/RouteLink'
import {HeadingMedium, LabelLarge, LabelSmall, ParagraphMedium, ParagraphSmall} from 'baseui/typography'
import {Cell, Row, Table} from '../components/common/Table'
import {useAllProductAreas, useAllTeams} from '../api'
import * as _ from 'lodash'

export enum NotificationType {
  PA = "PA",
  TEAM = "TEAM",
  ALL_EVENTS = "ALL_EVENTS"
}

export enum NotificationChannel {
  EMAIL = "EMAIL",
  SLACK = "SLACK"
}

export enum NotificationTime {
  ALL = "ALL", DAILY = "DAILY", WEEKLY = "WEEKLY", MONTHLY = 'MONTHLY'
}

export interface Notification {
  id?: string
  ident: string
  target?: string
  type: NotificationType
  time: NotificationTime
  channels: NotificationChannel[]
}

const getNotifications = async () => axios.get<PageResponse<Notification>>(`${env.teamCatalogBaseUrl}/notification`)

const getNotification = async (id: string) => axios.get<Notification>(`${env.teamCatalogBaseUrl}/notification/${id}`)

const saveNotification = async (notification: Notification) => axios.post<Notification>(`${env.teamCatalogBaseUrl}/notification`, notification)

export const deleteNotification = async (id: string) => axios.delete<Notification>(`${env.teamCatalogBaseUrl}/notification/${id}`)

export const useNotificationsFor = (type: NotificationType, targetId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  useEffect(() => {
    getNotifications().then(d => setNotifications(d.data.content))
  }, [])
  const list = notifications.filter(n => (!targetId || n.target === targetId) && n.type === type)
  const notificationByTime = (time: NotificationTime) => list.find(n => n.time === time)

  const write = (notification: Notification) => {
    if (!targetId && type !== NotificationType.ALL_EVENTS) return
    saveNotification(notification).then(r => setNotifications([...notifications.filter(n => n.id !== r.data.id), r.data]))
  }

  const del = (id: string) => {
    deleteNotification(id).then(r => setNotifications(notifications.filter(n => n.id !== id)))
  }

  const add = (time: NotificationTime, channel: NotificationChannel) => {
    const not = notificationByTime(time)
    let notification: Notification
    if (not) {
      notification = {...not, channels: [...not.channels, channel]}
    } else {
      notification = {
        ident: user.getIdent(),
        target: targetId,
        type,
        time,
        channels: [channel]
      }
    }
    write(notification)
  }

  const remove = (id: string, channel: NotificationChannel) => {
    const not = notifications.find(n => n.id === id)
    if (!not) return
    const afterChannels = [...not?.channels || []]
    _.remove(afterChannels, ch => ch === channel)
    if (afterChannels.length === 0) del(not.id!)
    else {
      write({...not, channels: afterChannels})
    }
  }

  const exists = list.flatMap(n => n.channels.map(c => ({id: n.id, time: n.time, channel: c})))
  const state = timeTypes.map(time => ({
    time,
    // channels: channelTypes.map(channel => ({channel, exists: exists.find(e => e.time === time && e.channel === channel)?.id}))
    email: exists.find(e => e.time === time && e.channel === NotificationChannel.EMAIL)?.id,
    slack: exists.find(e => e.time === time && e.channel === NotificationChannel.SLACK)?.id
  }))
  .sort(timeSort)

  return {list, length: list.length, add, remove, state, allNotifications: notifications.sort(timeSort)}
}

const lang = {
  ALL: "Kontinuerlig",
  DAILY: "Daglig",
  WEEKLY: "Ukentlig",
  MONTHLY: "Månedlig",

  ALL_EVENTS: "Alle hendelser",
  TEAM: "Team",
  PA: "Område",
}

const timeTypes = Object.keys(NotificationTime).map(v => v as NotificationTime)
const typeTypes = Object.keys(NotificationType).map(v => v as NotificationType)
const channelTypes = Object.keys(NotificationChannel).map(v => v as NotificationChannel)

const timeSort = (a: {time: NotificationTime}, b: {time: NotificationTime}) => timeTypes.indexOf(a.time) - timeTypes.indexOf(b.time)
const typeSort = (a: {type: NotificationType}, b: {type: NotificationType}) => typeTypes.indexOf(a.type) - typeTypes.indexOf(b.type)

const hasChannel = (channels: NotificationChannel[], ch: NotificationChannel) => channels.indexOf(ch) >= 0
const iconFor = (channel: NotificationChannel) => channel === NotificationChannel.EMAIL ? faEnvelope : faSlack

export const NotificationBell = (props: {targetId: string, type: NotificationType}) => {
  const {targetId, type} = props
  const notifications = useNotificationsFor(type, targetId)
  if (!env.enableNotifications || !user.isLoggedIn()) return null

  return (
    <StatefulPopover content={
      <Card>
        <Block display='flex' flexDirection='column'
               marginTop={theme.sizing.scale100}
               marginLeft={theme.sizing.scale100}
               marginRight={theme.sizing.scale100}
        >
          <LabelLarge>Varsler</LabelLarge>
          {notifications.state.map((state, i) =>
            <React.Fragment key={i}>
              <Block display='flex' marginBottom={theme.sizing.scale100}>
                <Button size='compact' kind='outline'
                        $style={{color: state.email ? theme.colors.primary400 : theme.colors.mono400}}
                        onClick={() => state.email ? notifications.remove(state.email, NotificationChannel.EMAIL) : notifications.add(state.time, NotificationChannel.EMAIL)}
                        marginRight>
                  <span><FontAwesomeIcon icon={faEnvelope}/> Epost</span>
                </Button>
                <Button size='compact' kind='outline'
                        $style={{color: state.slack ? theme.colors.primary400 : theme.colors.mono400}}
                        onClick={() => state.slack ? notifications.remove(state.slack, NotificationChannel.SLACK) : notifications.add(state.time, NotificationChannel.SLACK)}
                        marginRight>
                  <span><FontAwesomeIcon icon={faSlack}/> Slack</span>
                </Button>
                {lang[state.time]}
              </Block>
            </React.Fragment>
          )}

        </Block>
        <Block width='100%' display='flex' justifyContent='flex-end'>
          <RouteLink href='/user/notifications'>
            <ParagraphSmall>Se alle mine varsler</ParagraphSmall>
          </RouteLink>
        </Block>
      </Card>
    }>
      <Block display='flex' alignItems='center' $style={{cursor: 'pointer'}}>
        <Block marginLeft={theme.sizing.scale800} marginRight={theme.sizing.scale800} display='flex'>
          <Block>

            <span><FontAwesomeIcon icon={notifications.length > 0 ? faBellSolid : faBell}/></span>
          </Block>
        </Block>
      </Block>
    </StatefulPopover>
  )
}

export const NotificationPage = () => {
  const notifications = useNotificationsFor(NotificationType.ALL_EVENTS)
  const teams = useAllTeams()
  const pas = useAllProductAreas()

  const target = (id?: string) => {
    if (!id) return lang[NotificationType.ALL_EVENTS]
    const team = teams.filter(t => t.id === id)[0]
    const pa = pas.filter(p => p.id === id)[0]
    return (
      <>
        {team && <RouteLink href={`/team/${team.id}`}>{team.name}</RouteLink>}
        {pa && <RouteLink href={`/productarea/${pa.id}`}>{pa.name}</RouteLink>}
      </>
    )
  }

  return (
    <>
      <HeadingMedium>Varsler</HeadingMedium>

      <ParagraphMedium>
        Gå til et team eller område for å aktivere varsel, eller aktiver alle varsel her.
      </ParagraphMedium>

      {!user.isLoggedIn() && <LabelLarge>Du må logge inn for å endre varsler</LabelLarge>}
      {user.isLoggedIn() && <>
        <Table
          emptyText={'varsler'}
          data={notifications.allNotifications}
          config={{
            useDefaultStringCompare: true,
            initialSortColumn: 'type',
            sorting: {
              type: typeSort,
              time: timeSort
            }
          }
          }
          headers={[
            {title: 'Navn', column: 'target'},
            {title: 'Frekvens', column: 'time'},
            {title: 'Type', column: 'type'},
            {title: 'Slett', small: true}
          ]}

          render={table => table.data.map(notification =>
            <Row key={notification.id}>
              <Cell>{target(notification.target)}</Cell>
              <Cell>{lang[notification.time]}</Cell>
              <Cell>{lang[notification.type]}</Cell>
              <Cell small>
                <>
                  {hasChannel(notification.channels, NotificationChannel.EMAIL) &&
                  <Button size='compact' kind='outline' onClick={() => notifications.remove(notification.id!, NotificationChannel.EMAIL)} marginRight>
                    <span><FontAwesomeIcon icon={iconFor(NotificationChannel.EMAIL)} color={theme.colors.negative400} size='lg'/> Epost</span>
                  </Button>}
                  {hasChannel(notification.channels, NotificationChannel.SLACK) &&
                  <Button size='compact' kind='outline' onClick={() => notifications.remove(notification.id!, NotificationChannel.SLACK)}>
                    <span><FontAwesomeIcon icon={iconFor(NotificationChannel.SLACK)} color={theme.colors.negative400} size='lg'/> Slack</span>
                  </Button>}
                </>
              </Cell>
            </Row>)}/>

        {!!notifications.state.find(s => !s.slack || !s.email) &&
        <Block display='flex' alignItems='center' marginTop={theme.sizing.scale600}>
          <LabelSmall marginRight={theme.sizing.scale400}>Aktiver varsel for alle hendelser</LabelSmall>
          <Block display='flex' flexDirection='column'>
            {notifications.state.filter(s => !s.email || !s.slack).map((state, i) =>
              <Block key={'' + i + state.time} marginBottom='1rem'>
                {!state.email &&
                <Button size='compact' kind='outline' onClick={() => notifications.add(state.time, NotificationChannel.EMAIL)} marginRight>
                  <span><FontAwesomeIcon icon={iconFor(NotificationChannel.EMAIL)} size='lg'/> Epost</span>
                </Button>}
                {!state.slack &&
                <Button size='compact' kind='outline' onClick={() => notifications.add(state.time, NotificationChannel.SLACK)} marginRight>
                  <span><FontAwesomeIcon icon={iconFor(NotificationChannel.SLACK)} size='lg'/> Slack</span>
                </Button>}
                <span>{lang[state.time]}</span>
              </Block>
            )}
          </Block>
        </Block>
        }
      </>}

    </>
  )
}
