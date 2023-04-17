import { Constants } from 'eris'
import {
  Server,
  serversByGuild,
} from '../servers.js'


export const type = Constants.ApplicationCommandTypes.CHAT_INPUT

export const description = 'Get notes for a player.'

export const options = [
  {
    name: 'ckey',
    type: Constants.ApplicationCommandOptionTypes.STRING,
    description: 'the ckey of the player to get notes for.',
    required: true
  }
]

export async function handler (interaction) {
  let server = serversByGuild[interaction.guildID]

  if (!(server instanceof Server)) {
    interaction.createMessage('No such server.')
    return
  }

  if (!(server.notes)) {
    interaction.createMessage(`${server.name} does not have a notes handler.`)
    return
  }

  let acknowledged = interaction.acknowledge()
  let result = await server.notes(interaction.data.options[0].value)

  await acknowledged
  if (!result) {
    interaction.createFollowup(`Failed to get notes for ${interaction.data.options[0].value}.`)
    return
  }

  //replace all instances of '+' with ' ' for readability
  result["notes"] = result["notes"].replace(/\+/g, ' ')

  //Send the response as a text file
  interaction.createFollowup({
    content: `Notes for ${interaction.data.options[0].value}`,
    file: {
      name: `${interaction.data.options[0].value}.txt`,
      file: Buffer.from(result["notes"])
    }
  })
}
