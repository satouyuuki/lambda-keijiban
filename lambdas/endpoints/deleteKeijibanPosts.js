const Dynamo = require('../common/Dynamo');
const S3 = require('../common/S3');
const Responses = require('../common/API_Responses');

const TableName = process.env.tableName;
const bucketName = process.env.imageUploadBucket;

exports.handler = async (event, context, callback) => {
  const id = event.pathParameters.id;
  const { fileName, password } = JSON.parse(event.body);
  try {
    // dynamodbでdelete
    const dbRes = await Dynamo.delete(id, TableName, password);
    if (fileName) {
      await S3.delete(fileName, bucketName)
        .catch(err => {
          console.log('error in S3 delete', err);
          return null;
        });
    }
    return Responses._200(dbRes.Attributes);
  } catch (err) {
    err.message = 'パスワードが違います';
    return Responses._400(err);
  }
}
