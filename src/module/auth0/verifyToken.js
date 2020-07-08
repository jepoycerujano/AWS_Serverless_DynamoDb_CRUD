const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const Logger = require('../../../lib/Logger');

const { AUTH0_DOMAIN } = process.env;

function verifyToken(authToken) {
  const decoded = jwt.decode(authToken, { complete: true });
  const { header } = decoded;

  const options = {
    algorithms: ['RS256'],
    header,
  };

  const client = jwksClient({
    jwksUri: `https://dev-${AUTH0_DOMAIN}.auth0.com/.well-known/jwks.json`,
  });

  function getKey(authHeader, callback) {
    client.getSigningKey(authHeader.kid, (error, key) => {
      Logger.error(`===>>> signingKey error ${JSON.stringify(error)}`);
      const signingKey = key.publicKey || key.rsaPublicKey;
      Logger.debug(`===>>> signingKey ${JSON.stringify(signingKey)}`);
      callback(null, signingKey);
    });
  }
  return new Promise((resolve, reject) => {
    jwt.verify(authToken, getKey, options, (error, authDecoded) => {
      if (error) {
        Logger.error(`===>>> verify token error ${JSON.stringify(error)}`);
        reject(error);
      }
      resolve(authDecoded);
    });
  });
}

module.exports = verifyToken;
