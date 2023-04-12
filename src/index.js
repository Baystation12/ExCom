import { Client } from 'eris'
import * as commands from './commands.js'
import { serversByGuild } from './servers.js'
import * as config from '../config.js'
import { listener } from './listener.js'

process.on('uncaughtException', function (error) {
  console.log(`Uncaught Exception: ${error}`)
  process.exit(1)
})

const eris = new Client(config.token, {
  intents: ['guilds', 'guildMessages']
})

eris.on('ready', function () {
  console.log('connected')
  for (const guild in serversByGuild) {
    for (const name in commands) {
      console.log(`registering ${name} for ${serversByGuild[guild].getName()}`)
      eris.createGuildCommand(guild, { ...commands[name], name })
    }
  }
  listener(eris)
})

eris.on('interactionCreate', function (interaction) {
  const command = commands[interaction.data.name]
  if (!command) {
    interaction.createMessage('Invalid command.')
    return
  }
  command.handler(interaction, eris)
})

eris.connect()
