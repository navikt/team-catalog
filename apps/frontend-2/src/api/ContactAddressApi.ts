import axios from 'axios'

import type {ContactAddress, PageResponse, SlackChannel, SlackUser} from '../constants'
import {env} from '../util/env'
import {useSearch} from '../util/hooks'


export const getSlackChannelById = async (id: string) => {
  return (await axios.get<SlackChannel>(`${environment.teamCatalogBaseUrl}/contactaddress/slack/channel/${id}`)).data
}

export const getSlackUserByEmail = async (id: string) => {
  return (await axios.get<SlackUser>(`${environment.teamCatalogBaseUrl}/contactaddress/slack/user/email/${id}`)).data
}

export const getSlackUserById = async (id: string) => {
  return (await axios.get<SlackUser>(`${environment.teamCatalogBaseUrl}/contactaddress/slack/user/id/${id}`)).data
}

export const searchSlackChannel = async (name: string) => {
  return (await axios.get<PageResponse<SlackChannel>>(`${environment.teamCatalogBaseUrl}/contactaddress/slack/channel/search/${name}`)).data.content
}

export const getContactAddressesByTeamId = async (teamId: string) => {
  return (await axios.get<PageResponse<ContactAddress>>(`${environment.teamCatalogBaseUrl}/contactaddress/team/${teamId}`)).data.content
}

export const useSlackChannelSearch = () => useSearch(searchSlackChannel)
