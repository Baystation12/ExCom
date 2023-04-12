import { topic } from '../byond.js'

export class Server {

  /// The server's user-friendly name
  #name

  getName () {
    return this.#name
  }

  /// The server's byond port
  #port

  getPort () {
    return this.#port
  }

  /// The server's byond host
  #host

  getHost () {
    return this.#host
  }

  /// The server's discord guild snowflake
  #guild

  getGuild () {
    return this.#guild
  }

  /// Topic() to the server, expecting a url encoded string response
  async queryTopic (message) {
    try {
      let response = await topic(this.#port, this.#host, message)
      console.log(response)
      return Object.fromEntries(
        response.split('&').map(function (chunk) {
          let [key, ...value] = chunk.split('=')
            return [
              decodeURIComponent(key),
              decodeURIComponent(value.join('='))
            ]
        })
      )
    }
    catch (error) {
      throw error
    }
  }

  constructor ({ name, port, host, guild } = {}) {
    this.#name = name
    this.#port = port
    this.#host = host
    this.#guild = guild
  }
}
