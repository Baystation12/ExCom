import { Constants } from 'eris'
import {
  Server,
  serversByGuild,
  getErisOptionsWithHandler
} from '../../servers.js'

export const type = Constants.ApplicationCommandTypes.CHAT_INPUT

export const description = 'fetches server status'

export const options = [
  {
    name: 'server',
    type: Constants.ApplicationCommandOptionTypes.STRING,
    description: 'the server to fetch a player list from',
    choices: getErisOptionsWithHandler('status')
  }
]

export async function handler (interaction) {
  let server = serversByGuild[interaction.data.options?.[0]?.value]
  if (!(server instanceof Server)) {
    server = serversByGuild[interaction.guildID]
  }
  if (!(server instanceof Server)) {
    interaction.createMessage('No such server.')
    return
  }
  if (!(server.status)) {
    interaction.createMessage(`${server.name} does not have a status handler.`)
    return
  }
  const acknowledged = interaction.acknowledge()
  const result = await server.status()
  await acknowledged
  if (!result) {
    interaction.createFollowup('Failed fetching status.')
    return
  }
  interaction.createFollowup(`${result.name} Status: Playing ${result.mode} for ${result.duration} with ${result.players} players and ${result.active} alive`)
}
