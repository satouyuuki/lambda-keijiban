const AWS = require('aws-sdk');
const { get } = require('./Dynamo');
const s3Client = new AWS.S3();

const S3 = {
  async write(data, fileName, bucket) {
    const params = {
      Bucket: bucket,
      Body: JSON.stringify(data),
      Key: fileName,
    };

    const newData = await s3Client.putObject(params).promise();

    if (!newData) {
      throw Error('there was an error writing the file');
    }

    return newData;
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