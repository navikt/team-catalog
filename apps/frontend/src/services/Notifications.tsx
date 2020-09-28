import React, {useEffect, useState} from 'react'
import axios from 'axios'
import {PageResponse} from '../constants'
import {env} from '../util/env'
import {Block} from 'baseui/block'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faBell} from '@fortawesome/free-regular-svg-icons'
import {faBell as faBellSolid, faMinusSquare, faPlusSquare, faTrash} from '@fortawesome/free-solid-svg-icons'
import {theme} from '../util'
import {StatefulPopover} from 'baseui/popover'
import Button from '../components/common/Button'
import {user} from './User'
import {Card} from 'baseui/card'
import RouteLink from '../components/common/RouteLink'
import {HeadingMedium, LabelLarge, LabelSmall, ParagraphMedium, ParagraphSmall} from 'baseui/typography'
import {Cell, Row, Table} from '../components/common/Table'
import {useAllProductAreas, useAllTeams} from '../api'


export enum NotificationType {
  PA = "PA",
  TEAM = "TEAM",
  ALL_EVENTS = "ALL_EVENTS"
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

}

const getNotifications = async () => axios.get<PageResponse<Notification>>(`${env.teamCatalogBaseUrl}/notification`)

const getNotification = async (id: string) => axios.get<Notification>(`${env.teamCatalogBaseUrl}/notification/${id}`)

const saveNotification = async (notification: Notification) => axios.post<Notification>(`${env.teamCatalogBaseUrl}/notification`, notification)

export const deleteNotification = async (id: string) => axios.delete<Notification>(`${env.teamCatalogBaseUrl}/notification/${id}`)

export const useNotificationsFor = (targetId?: string, typeFilter?: NotificationType) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  useEffect(() => {
    getNotifications().then(d => setNotifications(d.data.content))
  }, [])
  const list = notifications.filter(n => (!targetId || n.target === targetId) && (!typeFilter || n.type === typeFilter))

  const create = (time: NotificationTime, typeToCreate?: NotificationType) => {
    const type = typeFilter || typeToCreate
    if (!type || (!targetId && type !== NotificationType.ALL_EVENTS)) return
    const notification: Notification = {
      ident: user.getIdent(),
      target: targetId,
      type,
      time
    }
    saveNotification(notification).then(r => setNotifications([...notifications, r.data]))
  }

  const del = (id: string) => {
    deleteNotification(id).then(r => setNotifications(notifications.filter(n => n.id !== id)))
  }


  const timeExists = (type?: NotificationType) => list.filter(n => !type || n.type === type).map(n => n.time)
  const timeMissing = (type?: NotificationType) => timeTypes.filter(v => timeExists(type).indexOf(v) < 0)

  return {list, length: list.length, create, del, timeExists, timeMissing}
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

const timeSort = (a: {time: NotificationTime}, b: {time: NotificationTime}) => timeTypes.indexOf(a.time) - timeTypes.indexOf(b.time)
const typeSort = (a: {type: NotificationType}, b: {type: NotificationType}) => typeTypes.indexOf(a.type) - typeTypes.indexOf(b.type)

export const NotificationBell = (props: {targetId: string, type: NotificationType}) => {
  const {targetId, type} = props
  const notifications = useNotificationsFor(targetId, type)
  if (!env.enableNotifications || !user.isLoggedIn()) return null

  const states = [...notifications.timeMissing().map(time => (
    {id: undefined, time, action: () => notifications.create(time)}
  )),
    ...notifications.list.map(n => (
      {id: n.id, time: n.time, action: () => notifications.del(n.id!)}
    ))].sort(timeSort)

  return (
    <StatefulPopover content={
      <Card>
        <Block display='flex' flexDirection='column'
               marginTop={theme.sizing.scale100}
               marginLeft={theme.sizing.scale100}
               marginRight={theme.sizing.scale100}
        >
          <LabelLarge>Varsler</LabelLarge>
          {states.map((state, i) =>
            <React.Fragment key={i}>
              <Button size='compact' kind='outline' onClick={state.action}>
                <Block display='flex' justifyContent='space-between' width='100%'>
                  <FontAwesomeIcon icon={state.id ? faMinusSquare : faPlusSquare} color={state.id ? theme.colors.negative400 : theme.colors.positive400}/>
                  <Block marginRight={theme.sizing.scale100}/>
                  {lang[state.time]}
                </Block>
              </Button>
              <Block marginBottom={theme.sizing.scale100}/>
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
  const notifications = useNotificationsFor()
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
          data={notifications.list}
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
              <Cell small><Button kind='tertiary' onClick={() => notifications.del(notification.id!)}>
                <span><FontAwesomeIcon icon={faTrash} color={theme.colors.negative400}/></span>
              </Button> </Cell>
            </Row>)}/>

        {notifications.list.filter(n => n.type === NotificationType.ALL_EVENTS).length < 4 &&
        <Block display='flex' alignItems='center' marginTop={theme.sizing.scale600}>
          <LabelSmall marginRight={theme.sizing.scale400}>Aktiver varsel for alle hendelser</LabelSmall>
          {notifications.timeMissing(NotificationType.ALL_EVENTS).map(time =>
            <Block key={time} marginRight={theme.sizing.scale200}>
              <Button size='compact' kind='outline' onClick={() => notifications.create(time, NotificationType.ALL_EVENTS)}>
                <Block display='flex' justifyContent='space-between' width='100%'>
                  <FontAwesomeIcon icon={faPlusSquare} color={theme.colors.positive400}/>
                  <Block marginRight={theme.sizing.scale100}/>
                  {lang[time]}
                </Block>
              </Button>
            </Block>
          )}</Block>
        }
      </>}

    </>
  )
}
