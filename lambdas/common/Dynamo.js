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
};
module.exports = Dynamo;