const Dynamo = require('../common/Dynamo');
const S3 = require('../common/S3');
const Responses = require('../common/API_Responses');

const TableName = process.env.tableName;
const bucketName = process.env.imageUploadBucket;

exports.handler = async (event, context, callback) => {
  const id = event.pathParameters.id;
  const { fileName } = JSON.parse(event.body);
  console.log('fileName = ', fileName);
  if (fileName) {
    const res = await S3.delete(fileName, bucketName).catch(err => {
      console.log('error in S3 delete', err);
      return null;
    })
    console.log('s3 res = ', res);
  }
  // return the data

  const res = await Dynamo.delete(id, TableName);
  console.log('res = ', res);
  return Responses._200(res);
}
