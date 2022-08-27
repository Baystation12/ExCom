import { createConnection } from 'node:net'

const buildInboundMessage = text => {
  const textBytes = Buffer.from(text)
  const byteLength = textBytes.length + 6 // length after lengths; message + 5 nulls
  return Buffer.concat([
    Buffer.from([
      0x00, 0x83, // byond magic header
      (byteLength >> 8) & 0xFF, // upper length
      byteLength & 0xFF, // lower length
      0x00, 0x00, 0x00, 0x00, 0x00 // 5-null padding
    ]),
    textBytes, // The message itself
    Buffer.from([0x00]) // end-of-message null
  ], byteLength + 4) // True buffer length; byteLength + magic header & length bytes
}

const consumeOutboundMessage = (buffer, loud) => {
  if (buffer[0] !== 0x00 || buffer[1] !== 0x83) { // byond magic header
    if (loud) {
      throw new Error('Invalid magic bits')
    }
    else {
      return undefined
    }
  }
  // ... bits 2 and 3 are lengths we don't care for
  if (buffer[4] === 0x00) { // if world/Topic returns nothing OR returns null, we get this
    return null
  }
  if (buffer[4] === 0x06) { // if world/Topic returns a string, we get this
    return buffer.subarray(5, -1).toString()
  }
  if (buffer[4] === 0x2a) { // if world/Topic returns a number, we get this
    return 0 // TODO: parse numbers (or not, we should be moving to json responses anyway)
    //3 = (00 83   00 05 2a   00 00 40 40)
    //4 = (00 83   00 05 2a   00 00 80 40)
    //5 = (00 83   00 05 2a   00 00 a0 40)
    //1234 = (00 83   00 05 2a   00 40 9a 44)
  }
  if (loud) {
    throw new Error('Invalid response type')
  }
  return undefined
}

export async function topic (port, host, message) {
  return await new Promise(function (resolve, reject) {
    let socket = createConnection(port, host)
      .on('error', function (error) {
        socket.end()
        reject(error)
      })
      .on('connect', function () {
        let encoded = buildInboundMessage(message)
        socket.write(encoded)
      })
      .on('data', function (data) {
        try {
          let decoded = consumeOutboundMessage(data)
          socket.end()
          resolve(decoded)
        }
        catch (error) {
          socket.end()
          reject(error)
        }
      })
  })
}
