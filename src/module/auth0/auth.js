const Logger = require('../../../lib/Logger');
const getToken = require('./getToken');
const verifyToken = require('./verifyToken');

function generatePolicy(principalId, effect, resource, scopes = []) {
  const policy = {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };

  if (Array.isArray(scopes) && scopes.length) {
    policy.context = { scopes: scopes.join('|') };
  }
  return policy;
}

exports.handler = async (event, context, callback) => {
  Logger.silly(`===>>> ${JSON.stringify(event)}`);
  const { authorizationToken, methodArn } = event;

  const token = await getToken(authorizationToken, methodArn);
  Logger.debug(`===>>> token ${token}`);

  const { permissions, sub } = await verifyToken(token);
  Logger.info(`===>>> permissions ${JSON.stringify(permissions)} and ${sub}`);

  const policy = (!permissions) ? generatePolicy(sub, 'Deny', methodArn) : generatePolicy(sub, 'Allow', methodArn, permissions);
  Logger.silly(`===>>> policy ${JSON.stringify(policy)}`);
  callback(null, policy);
};
