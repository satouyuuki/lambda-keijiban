const AWS = require('aws-sdk');
const s3Client = new AWS.S3();
const fileType = require('file-type');
const { v4: uuid } = require('uuid');
const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];

const S3 = {
  async write(bucket, mime, image) {
    if (!allowedMimes.includes(mime)) {
      throw Error('mime is not allow type');
    }
    let imageData = image;

    if (image.substr(0, 7) === 'base64,') {
      imageData = image.substr(7, image.length);
    }

    const buffer = Buffer.from(imageData, 'base64');
    const fileInfo = await fileType.fromBuffer(buffer);
    const detectedExt = fileInfo.ext;
    const detectedMime = fileInfo.mime;

    if (detectedMime !== mime) {
      throw Error('mime types dont match');
    }
    const name = uuid();
    const key = `${name}.${detectedExt}`;
    const params = {
      Bucket: bucket,
      Body: buffer,
      Key: key,
      ContentType: detectedMime,
      ACL: 'public-read'
    };

    const newData = await s3Client.putObject(params).promise();

    if (!newData) {
      throw Error('there was an error writing the file');
    }
    return `https://${process.env.imageUploadBucket}.s3.${process.env.region}.amazonaws.com/${key}`;
  },
  async update(bucket, mime, image, fileName) {
    if (!allowedMimes.includes(mime)) {
      throw Error('mime is not allow type');
    }
    let imageData = image;

    if (image.substr(0, 7) === 'base64,') {
      imageData = image.substr(7, image.length);
    }

    const buffer = Buffer.from(imageData, 'base64');
    const fileInfo = await fileType.fromBuffer(buffer);
    const detectedExt = fileInfo.ext;
    const detectedMime = fileInfo.mime;

    if (detectedMime !== mime) {
      throw Error('mime types dont match');
    }
    const key = !fileName ? uuid() + '.' + detectedExt : fileName;
    const params = {
      Bucket: bucket,
      Body: buffer,
      Key: key,
      ContentType: detectedMime,
      ACL: 'public-read'
    };

    const newData = await s3Client.putObject(params).promise();
    if (!newData) {
      throw Error('there was an error writing the file');
    }
    return `https://${bucket}.s3.${process.env.region}.amazonaws.com/${key}`;
    // return newData;
  },
  async delete(fileName, bucket) {
    const params = {
      Bucket: bucket,
      Key: fileName
    };

    const response = await s3Client.deleteObject(params).promise();

    if (!response) {
      throw Error('there was an error writing the file');
    }

    return response;
  },

}
module.exports = S3;