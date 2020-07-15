const Logger = require('../../../lib/Logger');

function getToken(authorizationToken, methodArn) {
  if (!authorizationToken || !methodArn) throw new Error('ERROR: Required token and method arn.');
  const [tokenMethod, authToken] = authorizationToken.split(' ');
  if (!authToken) return tokenMethod;
  Logger.info(`Method: ${tokenMethod} Token: ${authToken} Arn: ${methodArn}`);
  if (!tokenMethod.toLowerCase() === 'bearer' && authToken) throw new Error('ERROR: Unauthorized.');
  return authToken;
}

module.exports = getToken;
