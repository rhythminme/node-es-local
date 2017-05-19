const fs = require('fs');
const path = require('path');
const httpClientFactory = require('./httpClientFactory');

const createDirectoryIfNotExists = (directoryPath) => {
  if (!fs.existsSync(directoryPath)){
    fs.mkdirSync(directoryPath);
  }
}

const checkFileExistsAsync = (filename) => {
  return new Promise((resolve, reject) => {
    fs.access(filename, fs.constants.R_OK | fs.constants.W_OK, (err) => {
      return (!err) ? resolve(filename) : reject(filename);
    })
  })
}

module.exports.downloadAsync = (version, cacheDirectory) => {
  const filename = path.join(cacheDirectory, `elasticsearch-${version}.zip`)
  createDirectoryIfNotExists(cacheDirectory);

  return checkFileExistsAsync(filename)
    .then((file) => {
      console.log(`${file} exists; no need to download it...`);
      return file;
    })
    .catch((file) => {
      console.log(`${file} does not exist; downloading it...`);
      return httpClientFactory.createSecureClient('artifacts.elastic.co')
        .downloadAsync(`/downloads/elasticsearch/elasticsearch-${version}.zip`, file, 30000);
    })
};
