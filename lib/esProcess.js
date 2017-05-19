const fs = require('fs');
const childProcess = require("child_process");

module.exports.start = (namePrefix, elasticsearchBinaryPath, elasticsearchPort) => {
  return new Promise((resolve, reject) => {
    fs.chmod(elasticsearchBinaryPath, '0777', (err) => {
      if (err) {
        return reject(err)
      }
      const arguments = ['-d', '-p', 'pid', `-Ecluster.name=${namePrefix}`, `-Enode.name=${namePrefix}-node`, `-Ehttp.port=${elasticsearchPort}`]
      const process = childProcess.spawn(elasticsearchBinaryPath, arguments, { detached: true, stdio: 'ignore' });
      resolve(process)
    })
  });
};
