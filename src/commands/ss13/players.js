import { Constants } from 'eris'
import {
  Server,
  serversByGuild,
  getErisOptionsWithHandler
} from '../../servers.js'

export const type = Constants.ApplicationCommandTypes.CHAT_INPUT

export const description = 'lists connected players'

export const options = [
  {
    name: 'server',
    type: Constants.ApplicationCommandOptionTypes.STRING,
    description: 'the server to fetch status from',
    choices: getErisOptionsWithHandler('players')
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
  if (!(server.players)) {
    interaction.createMessage(`${server.name} does not have a players handler.`)
    return
  }
  const acknowledged = interaction.acknowledge()
  const result = await server.players()
  await acknowledged
  if (!result) {
    interaction.createFollowup('Failed fetching status.')
    return
  }
  interaction.createFollowup(`${result.name} Players: ${result.players.join(', ')}`)
}
