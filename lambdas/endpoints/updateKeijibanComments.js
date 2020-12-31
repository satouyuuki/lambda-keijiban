const Dynamo = require('../common/Dynamo');
const Responses = require('../common/API_Responses');

const TableName = process.env.tableName;

exports.handler = async (event, context, callback) => {
  const id = event.pathParameters.id;

  const comments = JSON.parse(event.body);
  comments.name = comments.name || '名無しさん';
  const updateParams = {
    id,
    tableName: TableName,
    updateKey: 'comments',
    updateValue: comments
  };

  const res = await Dynamo.updateComment(updateParams);
  return Responses._200(res.Attributes);
}
