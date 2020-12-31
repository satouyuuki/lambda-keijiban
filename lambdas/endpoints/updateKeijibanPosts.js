const Dynamo = require('../common/Dynamo');
const Responses = require('../common/API_Responses');
const S3 = require('../common/S3');
const TableName = process.env.tableName;
const bucketName = process.env.imageUploadBucket;
exports.handler = async (event, context, callback) => {
  try {
    console.log('event = ', event);
    const id = event.pathParameters.id;
  
    // return the data
    const body = JSON.parse(event.body);
    const updateData = {};
    updateData.text = body.text;
    updateData.password = body.password;
    if (body.image && body.mime) {
      console.log('hogehoge');
      const s3Res = await S3.update(
        bucketName,
        body.mime,
        body.image,
        body.fileName
      );
      updateData.imageURL = s3Res;
    }
    const updateParams = {
      id,
      tableName: TableName,
      updateValue: updateData,
    };

    const res = await Dynamo.update(updateParams);
    return Responses._200(res.Attributes);
  } catch (err) {
    err.message = 'パスワードが違います';
    return Responses._400(err);
  }
}
