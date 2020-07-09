const Dynamo = require('../../../lib/DynamoDB');
const middyMiddleware = require('../../../lib/MiddleWare');
const Logger = require('../../../lib/Logger');
const scopeCheck = require('../auth0/scopeCheck');

const { WORKFLOW_ACTOR_TABLE } = process.env;
const actorsTable = new Dynamo(WORKFLOW_ACTOR_TABLE);

exports.handler = middyMiddleware((data, context, callback) => {
  const { scopes } = data;
  const { status, message } = scopeCheck(scopes, 'write:actor');

  if (status === 200) {
    actorsTable.updateItem(data, (error, result) => {
      if (error) {
        Logger.error(JSON.stringify(error));
        callback(null, { statusCode: 500, result: error });
        return;
      }
      callback(null, { statusCode: 200, result });
    });
    return;
  }

  callback(null, { statusCode: status, result: message });
});
