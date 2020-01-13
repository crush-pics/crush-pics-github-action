const FormData = require('form-data')
const fs = require('fs')

const formData = (param) => {
  const form = new FormData()
  form.append('file', fs.createReadStream(param.file))
  Object.keys(param).forEach(key => {
    if (key !== 'file') form.append(key, param[key]) 
  })  
  form.formHeaders = form.getHeaders()['content-type']
  return form
}

module.exports = formData