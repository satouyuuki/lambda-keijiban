const Responses = require('../common/API_Responses');
const Dynamo = require('../common/Dynamo');
const TableName = process.env.tableName;

exports.handler = async (event, context, callback) => {

  if (!event.pathParameters || !event.pathParameters.id) {
    // idが渡されて無い
    return Responses._400({ message: 'idを指定してください' });
  }
  const id = event.pathParameters.id;
  const res = await Dynamo.get(id, TableName).catch(err => {
    console.log('error =', err);
    return null
  });

  // idが存在しない時
  if (!res) {    
    return Responses._400({ message: '指定したidのデータは存在しません' });
  }
  return Responses._200(res);
}