const https = require('https');
const http = require('http');
const fs = require('fs');

const timeoutWrapper = (reject, req) => {
  return () => {
    req.abort();
    reject('Download timed out!');
  };
};

class HttpClient {
  constructor(host, port) {
    this.host = host;
    this.port = port || 80;
    this.module = this.module || http;
  }

  getObjectAsync(path, timeoutInMillis) {
    const errors = [];
    let data = '';

    return new Promise((resolve, reject) => {
      const request = this.module.get({
        host: this.host,
        port: this.port,
        path: path,
        headers: {
          'Cache-Control': 'no-cache, no-store, no-transform'
        },
        agent: false
      }).on('response', (response) => {
        if (response.statusCode !== 200) {
          errors.push(`Wrong status code: ${response.statusCode}`);
        }

        response.on('data', (chunk) => {
          data += chunk;
          clearTimeout(timeoutId);
          timeoutId = setTimeout(fn, timeoutInMillis);
        }).on('error', (error) => {
          errors.push(error);
          clearTimeout(timeoutId);
          reject(errors);
        }).on('end', () => {
          clearTimeout(timeoutId);
          resolve(JSON.parse(data))
        });
      }).on(`error`, (error) => {
        errors.push(error);
        clearTimeout(timeoutId);
        reject(errors);
      });

      const fn = timeoutWrapper(reject, request);
      let timeoutId = setTimeout(fn, timeoutInMillis);
    });
  }

  downloadAsync(path, filename, timeoutInMillis) {
    const file = fs.createWriteStream(filename);
    const errors = [];

    return new Promise((resolve, reject) => {
      const request = this.module.get({
        host: this.host,
        port: this.port,
        path: path,
        headers: {
          'Cache-Control': 'no-cache, no-store, no-transform'
        },
        agent: false
      }).on('response', (response) => {
        if (response.statusCode !== 200) {
          errors.push(`Wrong status code: ${response.statusCode}`);
        }

        const len = parseInt(response.headers['content-length'], 10);
        let downloaded = 0;

        response.on('data', (chunk) => {
          file.write(chunk);
          downloaded += chunk.length;
          process.stdout.write('Downloading ' + (100.0 * downloaded / len).toFixed(2) + '% ' + downloaded + ' bytes\r');

          clearTimeout(timeoutId);
          timeoutId = setTimeout(fn, timeoutInMillis);
        }).on('end', () => {
          clearTimeout(timeoutId);
          file.end();
          process.stdout.write(`https://${this.host}${path} downloaded to: ${filename}\n`);
          resolve(filename);
        }).on('error', (error) => {
          errors.push(error);
          clearTimeout(timeoutId);
          reject(errors);
        });
      }).on(`error`, (error) => {
        errors.push(error);
        clearTimeout(timeoutId);
        reject(errors);
      });

      const fn = timeoutWrapper(reject, request);
      let timeoutId = setTimeout(fn, timeoutInMillis);
    });
  }
}

class SecureHttpClient extends HttpClient {
  constructor(host, port) {
    super(host, port || 443);
    this.module = https;
  }
}

module.exports = {
  createClient: (host, port) => {
    return new HttpClient(host, port);
  },
  createSecureClient: (host, port) => {
    return new SecureHttpClient(host, port);
  }
};
