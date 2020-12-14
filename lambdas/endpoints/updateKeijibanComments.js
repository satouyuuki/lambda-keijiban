const Dynamo = require('../common/Dynamo');
const Responses = require('../common/API_Responses');

const TableName = process.env.tableName;

exports.handler = async (event, context, callback) => {
  console.log('event = ', event);
  const id = event.pathParameters.id;

  const comments = JSON.parse(event.body);
  const updateParams = {
    id,
    tableName: TableName,
    updateKey: 'comments',
    updateValue: comments
  };

  const res = await Dynamo.updateComment(updateParams);
  return Responses._200(res);
}
