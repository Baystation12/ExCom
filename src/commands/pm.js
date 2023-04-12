import { Constants } from 'eris'
import {
  Server,
  serversByGuild,
  getErisOptionsWithHandler
} from '../servers.js'


export const type = Constants.ApplicationCommandTypes.CHAT_INPUT

export const description = 'PM a user on the server.'

export const options = [
  {
    name: 'ckey',
    type: Constants.ApplicationCommandOptionTypes.STRING,
    description: 'the ckey of the player to message.',
    required: true
  },
  {
    name: 'message',
    type: Constants.ApplicationCommandOptionTypes.STRING,
    description: 'The message to send.',
    required: true
  }
]

export async function handler (interaction) {
  let server = serversByGuild[interaction.guildID]

  if (!(server instanceof Server)) {
    interaction.createMessage('No such server.')
    return
  }

  if (!(server.pm)) {
    interaction.createMessage(`${server.name} does not have a pm handler.`)
    return
  }

  let acknowledged = interaction.acknowledge()
  let result = await server.pm(interaction.member.username, interaction.data.options[0].value, interaction.data.options[1].value)
  await acknowledged
  if (!result) {
    interaction.createFollowup(`Failed to send a message to ${interaction.data.options[0].value}.`)
    return
  }
  if (result['Message Successful'] ===  '')
    interaction.createFollowup(`Sent: ${interaction.data.options[0].value} -> ${interaction.data.options[1].value}`)
  else
    interaction.createFollowup(`Server did not send a proper response. Response: ${JSON.stringify(result)}`)
}
