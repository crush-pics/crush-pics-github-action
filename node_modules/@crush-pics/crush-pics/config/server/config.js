const os = require('os')
const clientVersion = 'v0.2.2'
const baseUrl = 'https://api.crush.pics/v1'

const serverConfig = {
  url: baseUrl,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Client-Version': `Crushpics-NodeJs-Client ${clientVersion}`,
    'Lang-Version': process.version,
    'OS-Version': `${os.platform()} ${os.arch()} ${os.release()}`
  }
}

module.exports = serverConfig
