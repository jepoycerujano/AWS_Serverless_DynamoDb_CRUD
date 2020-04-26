const Dynamo = require('../../../lib/DynamoDB');
const middyMiddleware = require('../../../lib/MiddleWare');

const { WORKFLOW_ACTOR_TABLE } = process.env;
const actorsTable = new Dynamo(WORKFLOW_ACTOR_TABLE);

exports.handler = Middy((event, context, callback) => {
  const { body } = event;
  const data = JSON.parse(body);
  console.log(data);
  if (typeof data !== 'object') throw new Error('Opsss! data parameters must be object');
  actorsTable.deleteItem(data, (error, result) => {
    if (error) throw new Error(`Opsss! error in deleting record. Error: ${error}`);
    console.log(JSON.stringify(result));
    callback(null, JSON.stringify(result));
  });
});
