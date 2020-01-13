const fs = require('fs').promises;
const axios = require('axios');

const downloadImages = async (images) => {
  for await (const image of images) {
    await axios({
      method: 'get',
      url: image.url,
      responseType: 'arraybuffer'
    }).then(response => {
      fs.writeFile(image.filePath, response.data);
    }).catch(error => {
      console.log(error);
    });
  }
}

module.exports = downloadImages;
