'use strict';

var isArray = require('lodash/lang/isArray');
var find = require('lodash/collection/find');
var hasKey = require('lodash/object/has');
var values = require('lodash/object/values');
var filter = require('lodash/collection/filter');
var _ = require('lodash');
var deepcopy = require('deepcopy');
var ObjectId = require('bson-objectid');
var sanitizeQuery = require('./../../../core/util/object-transformations').evaluateDotNotationObject;

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

  insert(data, callback) {
    var result = {
      ops: []
    }
    if (isArray(data)) {
      data.forEach((item) => {
        item = this._getObjectIdFromData(item);
        this.data[item._id] = item;
        result.ops.push(item);
      });
    } else {
      data = this._getObjectIdFromData(data);
      this.data[data._id] = data;
      result.ops.push(data);
    }

    callback(null, result);
  }

  remove(query, callback) {
    var result;
    var found;
    try {
      let toRemove;
      found = find(this._dataAsArray(), sanitizeQuery(query));
      toRemove = JSON.stringify(found);

      delete this.data[toRemove._id];
      /*result = filter(this.data, (record) => {
        return JSON.stringify(record) === toSkip;
      });

      this.data = result;*/
    } catch (error) {
      return callback(error);
    }

    callback(null, found);
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

      if (!data) return callback(null, response);

      var dataToUpdate = deepcopy(this.data[record._id])
      if (data.$set) {
        data = Object.assign(dataToUpdate, data.$set)
      }

      this.data[record._id] = data

      response.result.nModified = 1;
      response.result.n = 1;

      callback(null, response);
    });
  }

  find(query, callback) {
    var result;

    try {
      result = filter(this._dataAsArray(), sanitizeQuery(query));
    } catch (error) {
      return callback(error);
    }
    callback(null, result);
  }

  findOne(query, callback) {
    var result;

    try {
      if (this._isObjectId(query)) {
        result = this.data[query];
      } else {
        result = find(this._dataAsArray(), sanitizeQuery(query));
      }
    } catch (error) {
      return callback(error);
    }
    callback(null, result);
  }

  count(query, callback) {
    this.find(query, (error, results) => {
      if (error) return callback(error);
      callback(null, results.length);
    });
  }
}

module.exports = FakeCollection;
