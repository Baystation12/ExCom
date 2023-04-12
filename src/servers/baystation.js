import { Server } from './Server.js'
import { key } from '../../config.js'

/// The last parsed ?status result from the server
let statusResult

/// The next time statusResult will be updated
let nextStatus

/// Updates statusResult by asking the server for a ?status topic response
async function updateStatusResult () {
  const time = Date.now()
  if (time < nextStatus) {
    return
  }
  nextStatus = time + 10e3
  statusResult = await baystation.queryTopic('status=2')
    .catch(error => error)
  if (statusResult instanceof Error) {
    return
  }
  statusResult.playerlist = statusResult.playerlist?.split('&')
  if (!statusResult.playerlist) {
    statusResult.playerlist = []
  }
}

export const baystation = new class extends Server {

  /// Collects the current round status on the server
  async status () {
    await updateStatusResult()
    if (statusResult instanceof Error) {
      console.log(statusResult)
      return null
    }
    return {
      name: this.getName(),
      mode: statusResult.mode,
      players: statusResult.playerlist.length,
      active: statusResult.active_players,
      duration: statusResult.roundduration
    }
  }

  /// Collects a list of players on the server
  async players () {
    await updateStatusResult()
    if (statusResult instanceof Error) {
      return null
    }
    return {
      name: this.getName(),
      players: statusResult.playerlist
    }
  }

  ///Collect a list of characters and their jobs on the server
  async manifest () {
    await updateStatusResult()
    if (statusResult instanceof Error) {
      return null
    }
    manifest = await baystation.queryTopic('manifest=1')
      .catch(error => error)
    if (manifest instanceof Error) {
      return null
    }
    return {
      name: this.getName(),
      manifest: manifest
    }
  }

  ///Sends a PM to a player on the server
  async pm (admin_username, ckey, message) {
    const result = await this.queryTopic(`adminmsg=${ckey}&msg=${message}&sender=${admin_username}&key=${key}`)
      .catch(error => error)
    if (result instanceof Error) {
      console.log(result)
      return null
    }
    return result
  }

  ///Get a players notes
  async notes (ckey) {
    const result = await this.queryTopic(`notes=${ckey}&key=${key}`)
      .catch(error => error)
    if (result instanceof Error) {
      return null
    }
    return result
  }

  ///Handle relayed ahelps from the server
  async ahelp (msg, eris, channel) {
    channel = eris.getChannel(channel)
    if (channel) {
      channel.createMessage(msg)
    }
  }

}({
  name: 'Baystation',
  port: 8000,
  host: '10.10.10.80', //'baystation.xyz',
  guild: '104289531796131840'
})
