const ElasticsearchLocal = require('./index')

const elasticsearchVersion = '5.2.0'
const elasticsearchPort = 9500
const cacheDirectory = './.cache'
const targetDirectory = './.installs'

new ElasticsearchLocal(elasticsearchVersion, elasticsearchPort, {
  cacheDirectory: cacheDirectory,
  installationDirectory: targetDirectory
}).start()
  .then(() => {
    return new ElasticsearchLocal(elasticsearchVersion, elasticsearchPort, {
      cacheDirectory: cacheDirectory,
      installationDirectory: targetDirectory
    }).stop()
  })
