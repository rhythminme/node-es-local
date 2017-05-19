const fs = require('fs');
const AdmZip = require('adm-zip');

module.exports.extractAsync = (filename, version, targetDirectory) => {
  const elasticsearchBinary = `${targetDirectory}/elasticsearch-${version}/bin/elasticsearch`;
  return new Promise((resolve) => {
    fs.access(elasticsearchBinary, fs.constants.R_OK | fs.constants.W_OK, (err) => {
      if (!err) {
        process.stdout.write(`${elasticsearchBinary} exists; no need to extract...\n`);
        return resolve(elasticsearchBinary)
      }

      const zip = new AdmZip(filename);
      zip.extractAllTo(targetDirectory, true);
      resolve(elasticsearchBinary)
    });
  });
};