export { Server } from './servers/Server.js'

import { baystation } from './servers/baystation.js'

export const serversByName = {
  [baystation.getName()]: baystation
}

export const serversByGuild = {
  [baystation.getGuild()]: baystation
}

export function getServersWithHandler(handler) {
  return Object.entries(serversByGuild)
    .filter(function([, server]) {
      return !!server[handler]
    })
}

export function getErisOptionsWithHandler(handler) {
  return getServersWithHandler(handler).map(function([guild, server]) {
    return {
      name: server.getName(),
      value: guild
    }
  })
}
