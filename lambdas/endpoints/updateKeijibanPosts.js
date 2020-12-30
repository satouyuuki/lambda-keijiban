const Dynamo = require('../common/Dynamo');
const Responses = require('../common/API_Responses');

const TableName = process.env.tableName;

exports.handler = async (event, context, callback) => {
  const id = event.pathParameters.id;

  // return the data
  const { text, password } = JSON.parse(event.body);
  const updateParams = {
    id,
    tableName: TableName,
    updateKey: 'text',
    updateValue: text,
    conditionValue: password
  };
  try {
    const res = await Dynamo.update(updateParams);
    return Responses._200(res.Attributes);
  } catch (err) {
    err.message = 'パスワードが違います';
    return Responses._400(err);
  }
}
