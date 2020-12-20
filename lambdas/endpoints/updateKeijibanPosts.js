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

  const res = await Dynamo.update(updateParams).catch(err => {
    console.log('update faild', err);
    return null;
  })
  if (!res) {
    return Responses._400({ message: 'response is null' });
  }
  return Responses._200(res.Attributes);
}
