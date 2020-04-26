const Dynamo = require('../../../lib/DynamoDB');
const middyMiddleware = require('../../../lib/MiddleWare');

const { WORKFLOW_ACTOR_TABLE } = process.env;
const actorsTable = new Dynamo(WORKFLOW_ACTOR_TABLE);

exports.handler = middyMiddleware((data, context, callback) => {
  actorsTable.insertItem(data, (error, result) => {
    if (error) throw new Error(`ERROR: Internal server. ===>>${error}`);
    callback(null, result);
  });
});
