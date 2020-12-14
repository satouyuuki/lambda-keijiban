const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();

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
  put: async (item, TableName) => {
    if (!item.id) {
      throw Error('idがありません');
    }

    const params = {
      TableName,
      Item: item,
      // ReturnValues: "ALL_OLD" // return {}
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
    };

    const res = await documentClient
      .update(params)
      .promise();

    return res;
  },
  updateComment: async ({ id, tableName, updateKey, updateValue }) => {
    const key = Object.keys(updateValue)[0];
    const value = Object.values(updateValue)[0];
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
        ':value': value
      },
    };

    const res = await documentClient
      .update(params)
      .promise();

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