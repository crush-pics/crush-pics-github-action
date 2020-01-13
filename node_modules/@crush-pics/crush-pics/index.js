const axios = require('axios')
const routes = require('./config/routes')
const formData = require('./utils/formData')
const validateIdParam = require('./utils/validateIdParam')
const crushPics = {}
let config = {}

if (typeof window === 'undefined') {
  config = require('./config/server/config')
} else {
  config = require('./config/client/config')
}

crushPics.config = {...config}

crushPics.configure = (configuration) => {
  Object.keys(configuration).forEach(property => {
    switch (property) {
      case 'api_token':
        crushPics.config.headers.Authorization = `Bearer ${configuration[property]}`
        break;
      case 'baseUrl':
        crushPics.config.url = configuration[property]
        break;
      default:
        throw new Error('Unknown configuration')
    }
  })

  if (!crushPics.config.headers.Authorization) throw new Error('token is required')
}

Object.keys(routes).forEach(el => {
  crushPics[el] = {}
  routes[el].forEach(key => {
    const apiCall = {
      'methodName': key[0],
      'method': key[1],
      'path': key[2]
    }

    crushPics[el][apiCall.methodName] = (param) => {
      let updatedConfig = {...crushPics.config}
      updatedConfig.method = apiCall.method
      updatedConfig.url = updatedConfig.url + apiCall.path

      if (apiCall.method === 'POST' && param && param.file) {
        if (typeof window === 'undefined') { // post file from server
          const form = formData(param)
          updatedConfig.data = form
          updatedConfig.headers['Content-Type'] = form.formHeaders
        } else { // post file from client
          const formData = new FormData()

          formData.append('file', param.file, param.file.name)
          formData.append('origin', 'api')
          updatedConfig.data = formData
        }
      } else {
        updatedConfig.headers['Content-Type'] = 'application/json'

        if (param) {
          if (apiCall.method === 'GET') {
            updatedConfig.params = {...param}
          } else {
            updatedConfig.data = {...param}
          }
        }
      }

      if (apiCall.path.includes(":id") && validateIdParam(param)) {
        updatedConfig.url = updatedConfig.url.replace(":id", param)
        delete updatedConfig.data
      }

      return axios(updatedConfig)
    }
  })
})

module.exports = crushPics
