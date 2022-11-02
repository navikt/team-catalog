import type {Process} from '../constants'
import {env} from './env'

export const navSlackTeamId = 'T5LNAMWNA'
export const slackChannelId = 'CG2S8D25D'

export const slackLink = (channelId: string) => `slack://channel?team=${navSlackTeamId}&id=${channelId}`
export const slackUserLink = (userId: string) => `slack://user?team=${navSlackTeamId}&id=${userId}`
export const appSlackLink = slackLink(slackChannelId)

export const githubRepo = 'https://github.com/navikt/team-catalog'
export const documentationLink = 'https://navikt.github.io/team-catalog/'
export const teamVisualizationLink = 'https://data.adeo.no/datapakke/44f2fb8ac44c7a971941e9174b94012f'
export const markdownLink = 'https://guides.github.com/features/mastering-markdown/'

export const slackRedirectUrl = (c: string) => `https://slack.com/app_redirect?team=${navSlackTeamId}&channel=${c.toLowerCase()}`
export const processLink = (p: Process) => `${env.processCatBaseUrl}/process/${p.id}`
