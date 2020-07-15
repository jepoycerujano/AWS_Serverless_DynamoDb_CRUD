/* eslint-disable no-param-reassign */
const Logger = require('../Logger');

function convertHandler() {
  const dataRecieved = {};
  return ({
    before(handler, next) {
      Logger.silly('calling middleware before');
      Logger.debug(JSON.stringify(handler.event));
      const {
        body,
        queryStringParameters,
        requestContext,
      } = handler.event;

      const { authorizer: { scopes } } = requestContext || [];

      if (!body || !Object.keys(body).length || typeof body !== 'object') {
        return handler.callback(null,
          {
            statusCode: 400,
            result: 'WARNING: Data parameter must be object.',
          });
      }
      Object.assign(dataRecieved, body);

      if (queryStringParameters) Object.assign(dataRecieved, queryStringParameters);

      if (scopes.length) Object.assign(dataRecieved, { scopes });

      Logger.info(JSON.stringify(dataRecieved));
      handler.event.body = dataRecieved;
      return next();
    },

    after(handler, next) {
      Logger.silly('calling middleware after');
      const { statusCode = 200, result = {} } = handler.response;
      Logger.debug(JSON.stringify(result));
      // https://www.serverless.com/blog/cors-api-gateway-survival-guide
      // NOTE: If you're making a request using credentials, the wildcard value is not allowed.
      // For your browser to make use of the response, the Access-Control-Allow-Origin response
      // headers must include the specific origin that made the request.
      handler.response = {
        statusCode,
        headers: {
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        },
        body: JSON.stringify(result),
      };
      return next();
    },

    onError(handler, next) {
      Logger.silly('calling middleware error');
      const { error } = handler;
      Logger.error(JSON.stringify(error));
      handler.response = {
        statusCode: 500,
        body: JSON.stringify(
          {
            message: 'ERROR: Internal server.',
            error,
          },
        ),
      };
      return next(error);
    },
  });
}

module.exports = convertHandler;
