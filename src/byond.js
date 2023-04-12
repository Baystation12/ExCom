//import { isUtf8 } from 'node:buffer' // node >= 18
import { Socket } from 'node:net'
import isUtf8 from 'utf-8-validate' // node < 18

function toHex (number) {
  return number.toString(16)
}


export function String2Daemon (string) {
  if (typeof string !== 'string' || !string.length)
    throw new Error('Bad payload. Must be non-empty string.')
  const stringBytes = Buffer.from(string)
  const byteLength = stringBytes.length + 6 // length after lengths; message + 5 nulls
  return Buffer.concat([
    Buffer.from([
      0x00, 0x83, // byond magic header
      (byteLength >> 8) & 0xFF, // upper length
      byteLength & 0xFF, // lower length
      0x00, 0x00, 0x00, 0x00, 0x00 // 5-null padding
    ]),
    stringBytes, // The message itself
    Buffer.from([0x00]) // end-of-message null
  ], byteLength + 4) // True buffer length; byteLength + magic header & length bytes
}


export function Daemon2Payload (buffer) {
  const [ magic1, magic2, sizeHigh, sizeLow, type, ] = buffer
  if (magic1 !== 0x00 || magic2 !== 0x83)
    throw new Error(`Invalid magic byte(s) [${toHex(magic1)},${toHex(magic2)}]`)
  if (type === 0x00)
    return null
  const payload = buffer.subarray(5, -1)
  if (type === 0x2a)
    return payload.readFloatLE(0)
  if (type === 0x06) {
    if (!isUtf8(payload))
      throw new Error('Invalid string payload.')
    return payload.toString()
  }
  throw new Error(`Invalid response type ${toHex(type)}`)
}


export async function topic (port, host, query, timeout = 10e3) {
  try {
    if (typeof query !== 'string')
      query = JSON.stringify(query)
    const message = String2Daemon(query)
    const response = await fetchTopic(port, host, message, timeout)
    return Daemon2Payload(response)
  }
  catch (error) {
    return error
  }
}


function fetchTopic (port, host, message, timeout) {
  let socket
  let timeoutHandle
  return new Promise(function (resolve, reject) {
    timeoutHandle = setTimeout(function () {
      const error = new Error(`Timed out (${timeout}ms)`)
      reject(error)
    }, timeout)

    let expected
    const response = []

    socket = new Socket()
    socket.unref()

    socket.once('error', function (error) {
      reject(error)
    })

    socket.once('ready', function () {
      socket.write(message)
    })

    socket.on('data', function (data) {
      response.push(...data)
      if (expected == null) {
        if (response.length < 4)
          return
        const [ magic1, magic2, sizeHigh, sizeLow ] = response
        if (magic1 !== 0x00 || magic2 !== 0x83) {
          const error = new Error(`Invalid magic byte(s) [${toHex(magic1)},${toHex(magic2)}]`)
          return reject(error)
        }
        expected = 4 + (sizeHigh << 8) + sizeLow
      }
      if (response.length > expected) {
        const error = new Error(`Invalid response length (${response.length} of ${expected})`)
        return reject(error)
      }
      if (response.length === expected) {
        const buffer = Buffer.from(response)
        return resolve(buffer)
      }
    })

    socket.connect(port, host)

  }).finally(function () {
    clearTimeout(timeoutHandle)
    if (!socket)
      return
    socket.removeAllListeners()
    socket.destroy()
  })
}
