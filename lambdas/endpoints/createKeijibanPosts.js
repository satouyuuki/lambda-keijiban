const Responses = require('../common/API_Responses');
const Dynamo = require('../common/Dynamo');
const TableName = process.env.tableName;

exports.handler = async (event, context, callback) => {
  console.log('event', event);
  const item = JSON.parse(event.body);
  const res = await Dynamo.put(item, TableName).catch(err => {
    console.log('error =', err);
    return null
  });

  // 作成に失敗した時
  if (!res) {    
    return Responses._400({ message: '作成に失敗しました' });
  }
  return Responses._200(res);
}