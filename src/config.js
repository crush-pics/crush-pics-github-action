const fs = require('fs').promises;
const crush = require('@crush-pics/crush-pics');
const CONFIG_PATH = ".github/crush-pics/config.json";

const readConfig = async () => {
  var customConfiguration = {};

  customConfiguration = await fs.readFile(CONFIG_PATH)
    .then((content) => JSON.parse(content))
    .catch((error) => console.error('Could not read config.json', error));

  return customConfiguration
}

const getConfig = async () => {
  const customConfiguration = await readConfig();
  const validCompressionTypes = ['balanced', 'lossy', 'lossless'];
  const configuration = {
    compression_type: 'balanced',
    strip_tags: false,
  };

  if (customConfiguration.api_url) {
    configuration.api_url = customConfiguration.api_url;
  }

  if (validCompressionTypes.includes(customConfiguration.compression_type)) {
    configuration.compression_type = customConfiguration.compression_type;
  }

  if (customConfiguration.compression_type === 'lossy' && customConfiguration.compression_level) {
    const level = parseInt(customConfiguration.compression_level);

    if (level >= 65 && level <= 100) {
      configuration.compression_level = level;
    } else {
      configuration.compression_level = 85
    }
  }

  if (customConfiguration.strip_tags) {
    configuration.strip_tags = !!customConfiguration.strip_tags;
  }

  return configuration
}

module.exports = getConfig;
