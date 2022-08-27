import { Server } from './Server.js'

/// The last parsed ?status result from the server
let statusResult

/// The next time statusResult will be updated
let nextStatus

/// Updates statusResult by asking the server for a ?status topic response
async function updateStatusResult () {
  let time = Date.now()
  if (time < nextStatus) {
    return
  }
  nextStatus = time + 10e3
  statusResult = await baystation.queryTopic('?status=2')
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

}({
  name: 'Baystation',
  port: 8000,
  host: 'baystation.xyz',
  guild: '104289531796131840'
})
