import DDBTable from '../../lib/DDBTable/Dynamodb';

const { WORKFLOW_ACTOR_TABLE } = process.env;
const actorsTable = new DDBTable(WORKFLOW_ACTOR_TABLE);

export default (event, context, callback) => {
  console.log(JSON.stringify(event));
  if (typeof event !== 'object') throw new Error('Opsss! data parameters  must be object');
  const { data } = event;

  actorsTable.insertItem(data, (error, result) => {
    if (error) throw new Error(`Opsss! error in getting record... ${error}`);
    callback(null, { data: result });
  });
};
