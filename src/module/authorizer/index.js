const middyMiddleware = require('../../../lib/MiddleWare');
// const Logger = require('../../../lib/Logger');
// const scopeCheck = require('../auth0/scopeCheck');

exports.handler = middyMiddleware((event, context, callback) => {
  const { body: data } = event;
  const { scopes } = data;
  callback(null, { statusCode: 200, result: scopes });
});
