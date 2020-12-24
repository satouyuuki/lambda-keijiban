const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const { v4: uuid } = require('uuid');
const Dynamo = {
  get: async (id, TableName) => {
    const params = {
      TableName,
      Key: { id }
    };
    const data = await documentClient
      .get(params)
      .promise();
    
    if (!data || !data.Item) {
      throw Error(`${TableName}に${id}がありません`);
    }
    
    return data.Item;
  },
  put: async (item, tableName) => {
    if (!item.id) {
      throw Error('idがありません');
    }

    const params = {
      TableName: tableName,
      Item: item,
      ReturnValues: "ALL_OLD"
    };
    
    const data = await documentClient
      .put(params)
      .promise()
    
    return data;
  },
  update: async ({ id, tableName, updateKey, updateValue }) => {
    const params = {
      TableName: tableName,
      Key: {
        id
      },
      UpdateExpression: `set #tx = :updateValue`,
      ExpressionAttributeNames: {
        '#tx': updateKey
      },
      ExpressionAttributeValues: {
        ':updateValue': updateValue
      },
      ReturnValues: 'ALL_NEW'
    };

    const res = await documentClient
      .update(params)
      .promise();

    return res;
  },
  updateComment: async ({ id, tableName, updateKey, updateValue }) => {
    const key = uuid();
    updateValue.date = new Date().getTime();
    const params = {
      TableName: tableName,
      Key: {
        id
      },
      UpdateExpression: `set #tx.#key = :value`,
      ExpressionAttributeNames: {
        '#tx': updateKey,
        '#key': key
      },
      ExpressionAttributeValues: {
        ':value': updateValue
      },
      ReturnValues: 'ALL_NEW'
    };

    const res = await documentClient
      .update(params)
      .promise();
    // const returnData = {};
    // returnData[key] = updateValue;
    // return returnData;
    return res;
  },
  delete: async (id, TableName) => {
    const params = {
      TableName,
      Key: { id }
    };
    const data = await documentClient
      .delete(params)
      .promise();

    return data;
  },
  scan: async (TableName) => {
    const params = {
      TableName
    };
    const res = await documentClient
      .scan(params)
      .promise();
    return res.Items;
  },
};
module.exports = Dynamo;