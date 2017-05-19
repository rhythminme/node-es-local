module.exports = (options, promiseToExecute) => {
  options.maxNumberOfRetryAttempts = options.maxNumberOfRetryAttempts || 20;
  options.backOffInMilliseconds = options.backOffInMilliseconds || 5000;

  return new Promise((resolve, reject) => {
    const attempt = (i) => {
      promiseToExecute(i)
        .then(resolve)
        .catch((err) => {
          if (i >= options.maxNumberOfRetryAttempts) {
            return reject(err);
          }
          setTimeout(() => attempt(i + 1), i * options.backOffInMilliseconds);
        });
    };
    attempt(1);
  });
};
