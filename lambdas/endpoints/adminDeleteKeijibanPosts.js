const Dynamo = require('../common/Dynamo');
const S3 = require('../common/S3');
const Responses = require('../common/API_Responses');

const TableName = process.env.tableName;
const bucketName = process.env.imageUploadBucket;

exports.handler = async (event, context, callback) => {
  console.log('event = ', event);
  const { fileName } = event.body;
  const { id } = event.path;
  console.log('id = ', id);
  console.log('fileName = ', fileName);
  try {
    // dynamodbでdelete
    const dbRes = await Dynamo.adminDelete(id, TableName);
    if (fileName) {
      await S3.delete(fileName, bucketName)
        .catch(err => {
          console.log('error in S3 delete', err);
          return null;
        });
    }
    return Responses._200(dbRes.Attributes);
  } catch (err) {
    return Responses._400(err);
  }
}
