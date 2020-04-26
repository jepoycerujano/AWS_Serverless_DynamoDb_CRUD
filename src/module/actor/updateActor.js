const Dynamo = require('../../../lib/DynamoDB');

const { WORKFLOW_ACTOR_TABLE } = process.env;
const actorsTable = new Dynamo(WORKFLOW_ACTOR_TABLE);

exports.handler = (event, context, callback) => {
  const { body } = event;
  const data = JSON.parse(body);
  console.log(data);
  if (typeof data !== 'object') throw new Error('Opsss! data parameters must be object');
  actorsTable.updateItem(data, (error, result) => {
    if (error) throw new Error(`Opsss! error in updating record. Error: ${error}`);
    console.log(JSON.stringify(result));
    callback(null, JSON.stringify(result));
  });
};
