const clientVersion = 'v0.2.2'
const baseUrl = 'https://api.crush.pics/v1'

if (!window.navigator) throw new Error('cannot access to global object window in client side')

const clientConfig = {
  url: baseUrl,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Client-Version': clientVersion,
    'Lang-Version': window.navigator.language,
    'OS-Version': window.navigator.platform
  }
}

module.exports = clientConfig
