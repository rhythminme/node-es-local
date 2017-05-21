# node-es-local
A simple low-dependency nodejs module that downloads, installs and starts elasticsearch v5.x locally for integration testing. Please note that this module currently only supports elasticsearch v5.x i.e. older versions are not supported.

The module attempts to download and unzip the package from the [Official Elasticsearch artifacts source](https://artifacts.elastic.co/downloads), if not already downloaded, and starts elasticsearch as a detached nodejs background process listening on the specified port.

To get started, npm install this module as a dev dependency:

```javascript
npm install --save-dev node-es-local
```

This module has a single external dependency on the following module for unzipping:

* [adm-zip](https://github.com/cthackers/adm-zip) - a pure Javascript (no-dependency) implementation of zip for nodejs

Once installed, you can use the module in your mocha tests or within gulp tasks.

## Usage

To download and start a local instance of elasticsearch:

```javascript
const ElasticsearchLocal = require('node-es-local')

const elasticsearchVersion = '5.2.0'
const elasticsearchPort = 9500
const cacheDirectory = './.cache'
const targetDirectory = './.installs'

new ElasticsearchLocal(elasticsearchVersion, elasticsearchPort, {
  cacheDirectory: cacheDirectory,
  installationDirectory: targetDirectory
}).start()
```

To stop a local instance of elasticsearch started by the previous script:

```javascript
const ElasticsearchLocal = require('node-es-local')

const elasticsearchVersion = '5.2.0'
const elasticsearchPort = 9500
const cacheDirectory = './.cache'
const targetDirectory = './.installs'

new ElasticsearchLocal(elasticsearchVersion, elasticsearchPort, {
  cacheDirectory: cacheDirectory,
  installationDirectory: targetDirectory
}).stop()
```

simples!