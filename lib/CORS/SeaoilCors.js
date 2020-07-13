const defaultCors = {
  origins: [],
  headers: [
    'Content-Type',
    'X-Amz-Date',
    'Authorization',
    'X-Api-Key',
    'X-Amz-Security-Token',
    'X-Amz-User-Agent',
  ],
  allowCredentials: false,
};


class SeaoilCors {
  /**
   * @constructor
   * @param {Boolean} opts.isDev - is development environment
   * @param {String} opts.origins - initial origins to add
   */
  constructor(opts = {}) {
    Object.assign(this, defaultCors);

    // Add origins for dev environments
    if (opts.isDev === true) {
      this.addOrigins(...[
        // http
        'http://localhost:3000',
        'http://localhost.seaoil.com.ph:3000',
        'http://*.seaoil.com.ph:3000',
        'http://172.16.82.170:3000',
        // https
        'https://localhost:3000',
        'https://localhost.seaoil.com.ph:3000',
        'https://*.seaoil.com.ph:3000',
        'https://172.16.82.170:3000',
      ]);
    }

    // Add ALLOWED_ORIGINS in environment
    if (typeof opts.origins === 'string') {
      const origins = (opts.origins || '').split(',').map((x) => x.trim());
      this.addOrigins(...origins);
    }
  }

  addOrigins(...origins) {
    if (!origins) return;
    const newOrigins = origins.filter((origin) => this.origins.indexOf(origin) < 0);
    this.origins.push(...newOrigins);
  }

  addHeaders(...headers) {
    if (!headers) return;
    const newHeaders = headers.filter((header) => this.headers.indexOf(header) < 0);
    this.headers.push(...newHeaders);
  }
}


module.exports = SeaoilCors;
