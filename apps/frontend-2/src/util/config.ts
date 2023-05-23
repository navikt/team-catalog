import type { Process } from "../constants";
import { env } from "./env";

export const navSlackTeamId = "T5LNAMWNA";
export const slackChannelId = "CG2S8D25D";

export const slackLink = (channelId: string) => `slack://channel?team=${navSlackTeamId}&id=${channelId}`;
export const appSlackLink = slackLink(slackChannelId);

export const documentationLink = "https://navikt.github.io/team-catalog/";
export const markdownLink = "https://guides.github.com/features/mastering-markdown/";

export const slackRedirectUrl = (c: string) =>
  `https://slack.com/app_redirect?team=${navSlackTeamId}&channel=${c.toLowerCase()}`;
export const processLink = (p: Process) => `${env.processCatBaseUrl}/process/${p.id}`;
