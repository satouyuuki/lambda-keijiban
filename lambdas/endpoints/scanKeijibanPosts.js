const Responses = require('../common/API_Responses');
const Dynamo = require('../common/Dynamo');
const TableName = process.env.tableName;

exports.handler = async (event, context, callback) => {
  // console.log('event', event);

  // const filterExpression = 'id = :id';
  // const expressionAttributes = {
  //   ':id': 1
  // }
  const posts = await Dynamo.scan(TableName).catch(err => {
    console.log('error in dynamo get', err);
    return null
  });
  return Responses._200(posts);
}