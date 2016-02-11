'use strict';

var isArray = require('lodash/lang/isArray');
var find = require('lodash/collection/find');
var hasKey = require('lodash/object/has');
var values = require('lodash/object/values');
var filter = require('lodash/collection/filter');
var _ = require('lodash');
var deepcopy = require('deepcopy');
var ObjectId = require('bson-objectid');
var sanitizeQuery = require('./util/object-transformations').evaluateDotNotationObject;
var logger = require('./logger');

var FakeCursor = require('./fake-cursor');

class FakeCollection {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.data = {};
  }

  _isObjectId(objectId) {
    return objectId.constructor.name === 'ObjectID';
  }

  _getObjectIdFromData(data) {
    if (!hasKey(data, '_id')) {
      data = Object.assign({_id: ObjectId()}, data)
    }
    return data;
  }

  _dataAsArray() {
    return values(this.data);
  }

  _updateInsertResponse(response, data) {
    response.result.n++;
    response.insertedCount++;
    response.insertedIds.push(data._id);
    response.ops.push(data);
    return response
  }

  insert(data, callback) {
    var response = {
      result: {ok: 1, n: 0},
      ops: [],
      insertedCount: 0,
      insertedIds: []
    };

    // TODO add error when ObjectId is already saved
    if (isArray(data)) {
      data.forEach((item) => {
        item = this._getObjectIdFromData(item);
        this.data[item._id] = item;
        response = this._updateInsertResponse(response, item);
      });
    } else {
      data = this._getObjectIdFromData(data);
      this.data[data._id] = data;
      response = this._updateInsertResponse(response, data)
    }

    callback(null, response);
  }

  deleteOne(query, callback) {
    var toRemove;
    var response = {
      result : {ok: 1, n: 0},
      deletedCount: 0
    }

    try {
      toRemove = find(this._dataAsArray(), sanitizeQuery(query));

      if (!toRemove) return callback(null, response)

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

    logger.debug('Search query on update');

    this.findOne(query, (error, record) => {
      if (error) return callback(error);

      if (!record) return callback(null, response);

      logger.debug('Id of object returned ' + record._id)

      var dataToUpdate = deepcopy(this.data[record._id])

      if (data.$unset) {
        _.forEach(Object.keys(data.$unset), (key) => {
          delete dataToUpdate[key];
        });
        data = Object.assign(dataToUpdate, data);
      }


      if (data.$set) {
        data = Object.assign(dataToUpdate, data.$set);
      }
      logger.debug('Document to update' + JSON.stringify(this.data[record._id]))

      data._id = record._id;
      this.data[record._id] = data
      logger.debug('Document updated' + JSON.stringify(data))

      response.result.nModified = 1;
      response.result.n = 1;

      callback(null, response);
    });
  }

  find(query, callback) {
    var result;
    var cursor;

    try {
      result = filter(this._dataAsArray(), sanitizeQuery(query));
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
        result = find(this._dataAsArray(), sanitizeQuery(query)) || null;
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
