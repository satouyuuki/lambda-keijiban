const Responses = require('../common/API_Responses');
const Dynamo = require('../common/Dynamo');
const fileType = require('file-type');
const { v4: uuid } = require('uuid');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
const tableName = process.env.tableName;

exports.handler = async (event, context, callback) => {
  try {
    const body = JSON.parse(event.body);
    // return the data
    if (!body || !body.text) {
      return Responses._400({ message: 'テキストは必須です' });
    }
    const dbObject = {};
    dbObject.id = uuid();
    dbObject.name = body.name || '名無しさん';
    dbObject.text = body.text;
    dbObject.date = new Date().getTime();
    dbObject.comments = {};

    if (body.image || body.mime) {
      if (!allowedMimes.includes(body.mime)) {
        return Responses._400({ message: 'mime is not allow type' });
      }
      let imageData = body.image;

      if (body.image.substr(0, 7) === 'base64,') {
        imageData = body.image.substr(7, body.image.length);
      }

      const buffer = Buffer.from(imageData, 'base64');
      const fileInfo = await fileType.fromBuffer(buffer);
      const detectedExt = fileInfo.ext;
      const detectedMime = fileInfo.mime;

      if (detectedMime !== body.mime) {
        return Responses._400({ message: 'mime types dont match' });
      }

      const name = uuid()
      const key = `${name}.${detectedExt}`;

      console.log(`writing image to bucket called ${key}`);
      console.log('process.env = ', process.env);
      console.log('test =', {
        Body: buffer,
        Key: key,
        ContentType: body.mime,
        Bucket: process.env.imageUploadBucket,
        ACL: 'public-read'
      })
      await s3.putObject({
        Body: buffer,
        Key: key,
        ContentType: body.mime,
        Bucket: process.env.imageUploadBucket,
        ACL: 'public-read'
      }).promise();

      const url = `https://${process.env.imageUploadBucket}.s3.${process.env.region}.amazonaws.com/${key}`;
      dbObject.imageURL = url;
    }
    const newPost = await Dynamo.put(dbObject, tableName).catch(err => {
      console.log('error in dynamo write', err);
      return null;
    })
    console.log('newPost = ', newPost);
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