const Dynamo = require('../common/Dynamo');
const Responses = require('../common/API_Responses');

const TableName = process.env.tableName;

exports.handler = async (event, context, callback) => {
  const id = event.pathParameters.id;

  // return the data
  const { text } = JSON.parse(event.body);
  const updateParams = {
    id,
    tableName: TableName,
    updateKey: 'text',
    updateValue: text
  };

  const res = await Dynamo.update(updateParams);
  console.log('res = ', res);
  return Responses._200({});
}
