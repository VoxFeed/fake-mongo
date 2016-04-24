'use strict';

const _ = require('lodash');
const Nedb = require('nedb');
const ObjectId = require('bson-objectid');
const FakeCursor = require('./fake-cursor');
const copyObject = require('./util/copy-object');
const formatForStore = require('./util/format-for-store');
const formatForResponse = require('./util/format-for-response');

const hasOperators = function(query) {
  let operatorRegex = /[\$in|\$gt|\$gte|\$lt|\$lte]/;
  return operatorRegex.test(JSON.stringify(query));
};

class FakeCollection {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.data = new Nedb({inMemoryOnly: true});;
  }

  _isObjectId(objectId) {
    return objectId.constructor.name === 'ObjectID';
  }

  _getObjectIdFromData(data) {
    if (!_.has(data, '_id')) {
      let base = {
        _id: ObjectId()
      };

      data = Object.assign(formatForStore(base), data);
    }

    return data;
  }

  _dataAsArray() {
    return _.values(this.data);
  }

  _updateInsertResponse(response, data) {
    if (_.isArray(data)) {
      response.ops = response.ops.concat(data);
    } else {
      response.ops.push(data);
    }
    response.ops.forEach((record) => {
      response.insertedIds.push(record._id);
      response.result.n++;
      response.insertedCount++;
    });

    return response;
  }

  insert(data, callback) {
    let response = {
      result: {ok: 1, n: 0},
      ops: [],
      insertedCount: 0,
      insertedIds: []
    };

    let dataToSave = formatForStore(data);
    // TODO add error when ObjectId is already saved
    if (_.isArray(dataToSave)) {
      dataToSave = dataToSave.map((item) => this._getObjectIdFromData(item));
    } else {
      dataToSave = this._getObjectIdFromData(dataToSave);
    }

    this.data.insert(dataToSave, (error, inserted) => {
      if (error) return callback(error);
      response = this._updateInsertResponse(response, formatForResponse(dataToSave));
      callback(null, response);
    });
  }

  deleteOne(query, callback) {
    let response = {
      result: {ok: 1, n: 0},
      deletedCount: 0
    };

    this.data.remove(formatForStore(query), (error, deletedCount) => {
      if (error) return callback(error);
      response.deletedCount = deletedCount;
      response.result.n = deletedCount;
      callback(null, formatForResponse(response));
    });
  }

  update(query, data, callback) {
    let response = {
      result: {
        ok: 1,
        nModified: 0,
        n: 0
      }
    };

    this.data.update(formatForStore(query), formatForStore(data), (error, nModified) => {
      if (error) return callback(error);
      response.result.nModified = nModified;
      response.result.n = nModified;
      callback(null, formatForResponse(response));
    });
  }

  find(query, callback) {
    this.data.find(formatForStore(query), (error, result) => {
      if (error) return callback(error);
      const cursor = new FakeCursor(formatForResponse(result));
      callback(null, cursor);
    });
  }

  findOne(query, callback) {
    if (this._isObjectId(query)) return this._findOneById(query, callback);
    this._findOneByQuery(query, callback);
  }

  _findOneById(query, callback) {
    query = formatForStore({_id: query});
    this.data.findOne(formatForStore(query), (error, result) => {
      if (error) return callback(error);
      callback(null, formatForResponse(result) || null);
    });
  }

  _findOneByQuery(query, callback) {
    this.data.findOne(formatForStore(query), (error, result) => {
      if (error) return callback(error);
      callback(null, formatForResponse(result) || null);
    });
  }

  count(query, callback) {
    this.find(query, (error, cursor) => {
      if (error) return callback(error);
      cursor.count(callback);
    });
  }
}

module.exports = FakeCollection;
