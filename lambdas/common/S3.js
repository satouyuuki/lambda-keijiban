const AWS = require('aws-sdk');
const s3Client = new AWS.S3();

const S3 = {
  async write(bucket, body, key, contentType) {
    const params = {
      Bucket: bucket,
      Body: body,
      Key: key,
      ContentType: contentType,
      ACL: 'public-read'
    };

    const newData = await s3Client.putObject(params).promise();

    if (!newData) {
      throw Error('there was an error writing the file');
    }

    return newData;
  },
  async delete(fileName, bucket) {
    console.log('filename, bucket = ', fileName, bucket);
    const params = {
      Bucket: bucket,
      Key: fileName
    };

    const response = await s3Client.deleteObject(params).promise();
    console.log('response = ', response);

    if (!response) {
      throw Error('there was an error writing the file');
    }

    return response;
  },

}
module.exports = S3;