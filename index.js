const httpClientFactory = require('./lib/httpClientFactory');
const elasticsearchDownloader = require('./lib/esDownloader');
const archiver = require('./lib/archiver');
const elasticsearchProcess = require('./lib/esProcess');
const retry = require('./lib/retry');

class ElasticsearchLocal {
  constructor(version, port, directories) {
    this.namePrefix = 'integration';
    this.version = version || '5.2.0';
    this.port = port || 9200;
    this.directories = directories || {};
    this.directories.cacheDirectory = this.directories.cacheDirectory || './.cachedArtifacts';
    this.directories.installationDirectory = this.directories.installationDirectory || './.installs';
  }

  start() {
    const timeoutMilliseconds = 5000;

    console.log(`Starting a local instance of elasticsearch version ${this.version} listening on port ${this.port}`);
    return this.getNodeInfo(timeoutMilliseconds)
      .then((processIds) => {
        processIds.forEach((processId) => {
          console.log(`Found elasticsearch node running with process id ${processId}`)
        })
      })
      .catch(() => {
        return elasticsearchDownloader.downloadAsync(this.version, this.directories.cacheDirectory)
          .then((filename) => {
            return archiver.extractAsync(filename, this.version, this.directories.installationDirectory)
          }).then((binaryPath) => {
            return elasticsearchProcess.start(this.namePrefix, binaryPath, this.port)
          }).then(() => {
            return this.checkClusterHealth(this.port, timeoutMilliseconds)
          })
      })
  }

  stop() {
    const timeoutMilliseconds = 5000;

    return this.getNodeInfo(this.port, timeoutMilliseconds)
    .then((processIds) => {
      processIds.forEach((processId) => {
        console.log(`Found elasticsearch node running with process id ${processId}; killing...`);
        process.kill(processId);
        console.log(`Elasticsearch node running with process id ${processId} is dead!`);
      })
    })
    .catch(() => {
      console.log(`Could not find any elasticsearch processes running on port ${this.port}`);
    })
  }

  getNodeInfo(timeoutInMillis) {
    return httpClientFactory.createClient('localhost', this.port)
      .getObjectAsync('/_nodes', timeoutInMillis)
      .then((nodeInfo) => {
        return Object.keys(nodeInfo.nodes).map(key => {
          return nodeInfo.nodes[key].process.id
        });
      })
  }

  checkClusterHealth(timeoutInMillis) {
    const maxNumberOfRetryAttempts = 5;
    const backOffInMilliseconds = 5000;

    return retry({ maxNumberOfRetryAttempts, backOffInMilliseconds }, (attempt) => {
      process.stdout.write(`Checking the health of our local elasticsearch cluster; attempt #${attempt}...\r`);
      return httpClientFactory.createClient('localhost', this.port)
        .getObjectAsync('/_cluster/health?wait_for_status=yellow&timeout=30s', timeoutInMillis)
        .then((health) => {
          process.stdout.write(`\nCluster with name '${health.cluster_name}' and ${health.number_of_nodes} node(s) is ${health.status}\n`)
          return health;
        })
    })
  }
}

module.exports = ElasticsearchLocal;
