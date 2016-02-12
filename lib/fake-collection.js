'use strict';

var _ = require('lodash');
var ObjectId = require('bson-objectid');
var FakeCursor = require('./fake-cursor');

var sanitizeQuery = require('./util/object-transformations').evaluateDotNotationObject;
var copyObject = require('./util/copy-object');

class FakeCollection {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.data = {};
  }

  _isObjectId(objectId) {
    return objectId.constructor.name === 'ObjectID';
  }

  _getObjectIdFromData(data) {
    if (!_.has(data, '_id')) {
      data = Object.assign({_id: ObjectId()}, data);
    }
    return data;
  }

  _dataAsArray() {
    return _.values(this.data);
  }

  _updateInsertResponse(response, data) {
    response.result.n++;
    response.insertedCount++;
    response.insertedIds.push(data._id);
    response.ops.push(data);
    return response;
  }

  insert(data, callback) {
    var response = {
      result: {ok: 1, n: 0},
      ops: [],
      insertedCount: 0,
      insertedIds: []
    };

    var dataToSave = copyObject(data);

    // TODO add error when ObjectId is already saved
    if (_.isArray(dataToSave)) {
      dataToSave.forEach((item) => {
        item = this._getObjectIdFromData(item);
        this.data[item._id] = item;
        response = this._updateInsertResponse(response, item);
      });
    } else {
      dataToSave = this._getObjectIdFromData(dataToSave);
      this.data[dataToSave._id] = dataToSave;
      response = this._updateInsertResponse(response, dataToSave);
    }

    callback(null, response);
  }

  deleteOne(query, callback) {
    var toRemove;
    var response = {
      result: {ok: 1, n: 0},
      deletedCount: 0
    };

    try {
      toRemove = _.find(this._dataAsArray(), sanitizeQuery(query));

      if (!toRemove) return callback(null, response);

      delete this.data[toRemove._id.toString()];

      response.result.n = 1;
      response.deletedCount = 1;
    } catch (error) {
      return callback(error);
    }

    callback(null, response);
  }

  update(query, data, callback) {
    var response = {
      result: {
        ok: 1,
        nModified: 0,
        n: 0
      }
    };

    this.findOne(query, (error, record) => {
      if (error) return callback(error);

      if (!record) return callback(null, response);

      var dataToUpdate = Object.assign({}, this.data[record._id]);

      if (data.$unset) {
        _.forEach(Object.keys(data.$unset), (key) => {
          delete dataToUpdate[key];
        });
        data = Object.assign(dataToUpdate, data);
      }

      if (data.$set) {
        data = Object.assign(dataToUpdate, data.$set);
      }

      data._id = record._id;
      this.data[record._id] = data;

      response.result.nModified = 1;
      response.result.n = 1;

      callback(null, response);
    });
  }

  find(query, callback) {
    var result;
    var cursor;

    try {
      result = _.filter(this._dataAsArray(), sanitizeQuery(query));
      cursor = new FakeCursor(result);
    } catch (error) {
      return callback(error);
    }
    callback(null, cursor);
  }

  findOne(query, callback) {
    var result;

    try {
      if (this._isObjectId(query)) {
        result = this.data[query] || null;
      } else {
        result = _.find(this._dataAsArray(), sanitizeQuery(query)) || null;
      }
    } catch (error) {
      return callback(error);
    }
    callback(null, result);
  }

  count(query, callback) {
    this.find(query, (error, cursor) => {
      if (error) return callback(error);
      cursor.count(callback);
    });
  }
}

module.exports = FakeCollection;
