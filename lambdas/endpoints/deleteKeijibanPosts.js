const Dynamo = require('../common/Dynamo');
const Responses = require('../common/API_Responses');

const TableName = process.env.tableName;

exports.handler = async (event, context, callback) => {
  const id = event.pathParameters.id;

  // return the data

  const res = await Dynamo.delete(id, TableName);
  console.log('res = ', res);
  return Responses._200(res);
}
