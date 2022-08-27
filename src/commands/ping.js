import { Constants } from 'eris'

export const type = Constants.ApplicationCommandTypes.CHAT_INPUT

export const description = 'pongs'

export async function handler (interaction) {
  interaction.createMessage('pong')
}
