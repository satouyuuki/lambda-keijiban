const Responses = require('../common/API_Responses');
const Dynamo = require('../common/Dynamo');
const S3 = require('../common/S3');
// const fileType = require('file-type');
const { v4: uuid } = require('uuid');

// const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
const tableName = process.env.tableName;
const bucketName = process.env.imageUploadBucket;

exports.handler = async (event, context, callback) => {
  try {
    const body = JSON.parse(event.body);
    if (!body || !body.text || !body.password) {
      return Responses._400({ message: 'テキスト/パスワードは必須です' });
    }
    const dbObject = {};
    dbObject.id = uuid();
    dbObject.name = body.name || '名無しさん';
    dbObject.text = body.text;
    dbObject.cookieFlag = body.cookieFlag;
    dbObject.password = body.password;
    dbObject.date = new Date().getTime();
    dbObject.comments = {};

    if (body.image && body.mime) {
      const s3Res = await S3.write(
        bucketName,
        body.mime,
        body.image,
      );
      dbObject.imageURL = s3Res;

    }
    const newPost = await Dynamo.put(dbObject, tableName).catch(err => {
      console.log('error in dynamo write', err);
      return null;
    })
    if (!newPost) {
      // failed as id not in the data
      return Responses._400({ message: 'Failed to write post by id' });
    }
    // returnが{}だからresを返す
    return Responses._200(dbObject);
    // return Responses._200({ newPost });

  } catch (error) {
    console.log('error', error);

    return Responses._400({ message: error.message || 'fail to upload iimage' });
  }
}