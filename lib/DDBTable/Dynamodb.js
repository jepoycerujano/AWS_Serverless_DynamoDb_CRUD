/* eslint-disable camelcase */
import { DynamoDB } from 'aws-sdk';
import moment from 'moment';

const { AWS_ENDPOINT_URL } = process.env;
const ddbClient = new DynamoDB({ endpoint: AWS_ENDPOINT_URL });

function createUpdateObj(data) {
  const ExpressionAttributeNames = {};
  const ExpressionAttributeValues = {};
  const UpdateExpArray = [];

  const dataKeys = Object.keys(data);
  dataKeys.forEach((key) => {
    if (typeof data[key] === 'undefined') return;

    // Skip keys
    if (key === 'id') return;

    Object.assign(ExpressionAttributeNames, {
      [`#updateExp_${key}`]: key,
    });

    Object.assign(ExpressionAttributeValues, {
      [`:updateExp_${key}`]: DynamoDB.Converter.marshall({ value: data[key] }).value,
    });

    UpdateExpArray.push(`#updateExp_${key} = :updateExp_${key}`);
  });

  const UpdateExpression = `SET ${UpdateExpArray.join(', ')}`;
  return { ExpressionAttributeNames, ExpressionAttributeValues, UpdateExpression };
}

export default class DDBTable {
  constructor(name) {
    if (typeof name !== 'string') throw new Error('Table name must be a string');
    Object.defineProperties(this, {
      name: { value: name },
      client: { value: ddbClient }, // for custom queries
    });
  }

  /**
   * Gets data from the database
   * @param {String} id - record id
   * @param {Number} version - version number (optional)
   * @param {Function} callback - function(err, record) - provides the record from DB
   */
  getItem({ id }, ...args) {
    const callback = args.pop();

    // Logger.debug(`Get Item > data: ${JSON.stringify(id)}`);

    this.getRecordById(id)
      .then((record) => callback(null, record))
      .catch((e) => callback(e, e.message));
  }

  /**
   * Gets data from the database
   * @param {String} id - record id
   * @param {String} columns - columns
   * @returns {Promise}
   */
  async getRecordById(id, columns) {
    console.log(`getRecordById: received id: ${id}`);
    console.log(`Columns: ${JSON.stringify(columns)}`);

    return new Promise((resolve, reject) => {
      const params = (() => {
        const query = {
          TableName: this.name,
          Limit: 1,
          KeyConditionExpression: 'id = :data',
          ExpressionAttributeValues: {
            ':data': { S: id },
          },
        };

        if (!columns) {
          return query;
        }

        return {
          ...query,
          ProjectionExpression: columns,
        };
      })();
      // Logger.debug(`ddbClient params: ${JSON.stringify(params)}`);

      ddbClient.query(params, (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        const { Count, Items } = result;

        // No records found
        if (Count < 1) {
          // Logger.debug('getRecordById: No record found.');
          resolve('No Record Found');
          return;
        }

        // 1st record only
        const record = DynamoDB.Converter.unmarshall(Items[0]);
        // Logger.debug(`getRecordById: Record: ${JSON.stringify(record)}`);
        resolve(record);
      });
    });
  }

  /**
   * Gets data from the database
   * @param {Array<String>} ids - record ids
   * @param {Array<String>} fields - record fields
   * @param {Function} callback - function(err, record) - provides the record from DB
   */
  async getMultiItem({ ids = [], fields = [] }, ...args) {
    const callback = args.pop();

    if (!Array.isArray(ids)) {
      const errMsg = 'Error due to invalid query parameter. Type should be array';
      // Logger.error(errMsg);
      callback(errMsg);
      return;
    }

    try {
      const results = await Promise.all(ids.map(async (id) => {
        const record = await this.getRecordById(id, fields.join(','));

        return {
          [id]: (() => {
            if (typeof record === 'string') {
              return { status: 400, message: record };
            }
            return record;
          })(),
        };
      }));

      // Logger.verbose(JSON.stringify(results));
      callback(null, Object.assign({}, ...results));
    } catch (e) {
      callback(null, e);
    }
  }

  /**
   * Inserts records to DB
   * @param {Object} data - data object
   * @param {Function} callback - function(err, result) - provides response from database
   */
  insertItem(data, callback) {
    if (typeof data !== 'object') throw new Error('data must be an obect');
    if (!data.id) throw new Error('id name must be present in the object');

    const now = moment().valueOf();
    const item = { ...data };
    // item.version = 0;
    if (item.created_at == null) item.created_at = now;
    if (item.updated_at == null) item.updated_at = now;

    const params = {
      TableName: this.name,
      Item: DynamoDB.Converter.marshall(item),
      ConditionExpression: 'attribute_not_exists(id)',
      ReturnConsumedCapacity: 'TOTAL',
    };

    // Logger.debug(`insertItem params: ${JSON.stringify(params)}`);
    ddbClient.putItem(params, (err, result) => {
      if (err) {
        callback(null, err);
        return;
      }

      // Logger.debug(`Insert Item result: ${JSON.stringify(result)}`);
      callback(null, result);
    });
  }

  /**
   * Updates records in DB
   * @param {Object} data - data object must contain id, and keys to be updated
   * @param {Function} callback - function(err, result) - provides response from database
   */
  updateItem(data, callback) {
    if (typeof data !== 'object') throw new Error('Data must be an object');
    if (!data.id) throw new Error('id name must be present in the object');

    // Get the current version
    this.getItem(data, (err, record) => {
      if (err) {
        callback(err);
        return;
      }

      if (!record) {
        callback(new Error('No records found.'));
        return;
      }

      const oldRecord = { ...record };
      const newRecord = { ...data };

      const now = moment().valueOf();
      newRecord.created_by = oldRecord.created_by;
      if (newRecord.created_at == null) newRecord.created_at = oldRecord.created_at || now;
      if (newRecord.updated_at == null) newRecord.updated_at = now;

      const {
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        UpdateExpression,
      } = createUpdateObj(newRecord);

      const params = {
        ReturnConsumedCapacity: 'TOTAL',
        TransactItems: [{
          Update: {
            TableName: this.name,
            ConditionExpression: 'attribute_exists(id)',
            ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
            ExpressionAttributeNames,
            ExpressionAttributeValues,
            Key: {
              id: { S: newRecord.id },
            },
            UpdateExpression,
          },
        },
        ],
      };

      // Logger.debug(`updateItem params: ${JSON.stringify(params)}`);
      ddbClient.transactWriteItems(params, (err2, result) => {
        if (err2) {
          // Logger.error(`Error in updating record|==>>>${JSON.stringify(result)}`);
          callback(null, err2);
        } else {
          // Logger.info(`Record successfully updated|==>>>${JSON.stringify(result)}`);
          callback(null, result);
        }
      });
    });
  }

  /**
   * Delete records to DB
   * @param {Object} data - data object
   * @param {Function} callback - function(err, result) - provides response from database
   */
  deleteItem({ id }, callback) {
    const params = {
      TableName: this.name,
      Key: {
        id: { S: String(id) },
      },
      ConditionExpression: 'attribute_exists(id)',
      ReturnValues: 'NONE', // optional (NONE | ALL_OLD)
      ReturnConsumedCapacity: 'TOTAL', // optional (NONE | TOTAL | INDEXES)
      ReturnItemCollectionMetrics: 'NONE', // optional (NONE | SIZE)
    };

    ddbClient.deleteItem(params, (error, result) => {
      if (error) { // an error occurred
        // Logger.error(`Error in deleting record|==>>>${JSON.stringify(error)}`);
        callback(null, error);
        return;
      }
      // Logger.info(`Success in deleting record|==>>>${JSON.stringify(result)}`);
      callback(null, result);
    });
  }
}
