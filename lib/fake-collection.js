'use strict';

var _ = require('lodash');
var Loki = require('lokijs');
var ObjectId = require('bson-objectid');
var FakeCursor = require('./fake-cursor');
var copyObject = require('./util/copy-object');
var formatForStore = require('./util/format-for-store');
var formatForResponse = require('./util/format-for-response');
var hasOperators = function(query) {
  let operatorRegex = /[\$in|\$gt|\$gte|\$lt|\$lte]/;
  return operatorRegex.test(JSON.stringify(query));
};

class FakeCollection {
  constructor(collectionName) {
    var db = new Loki();
    this.collectionName = collectionName;
    this.data = db.addCollection(collectionName);
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
    var response = {
      result: {ok: 1, n: 0},
      ops: [],
      insertedCount: 0,
      insertedIds: []
    };

    var dataToSave = formatForStore(data);
    // TODO add error when ObjectId is already saved
    if (_.isArray(dataToSave)) {
      dataToSave = dataToSave.map((item) => {
        item = this._getObjectIdFromData(item);
        return item;
      });
    } else {
      dataToSave = this._getObjectIdFromData(dataToSave);
    }
    this.data.insert(dataToSave);
    response = this._updateInsertResponse(response, formatForResponse(dataToSave));
    callback(null, response);
  }

  deleteOne(query, callback) {
    var toRemove;
    var response = {
      result: {ok: 1, n: 0},
      deletedCount: 0
    };

    try {
      if (hasOperators(query)) {
        toRemove = this.data.find(formatForStore(query)).pop();
      } else {
        toRemove = this.data.findObject(formatForStore());
      }

      if (!toRemove) return callback(null, response);
      this.data.remove(toRemove);

      response.result.n = 1;
      response.deletedCount = 1;
    } catch (error) {
      return callback(error);
    }

    callback(null, formatForResponse(response));
  }

  update(query, data, callback) {
    var response = {
      result: {
        ok: 1,
        nModified: 0,
        n: 0
      }
    };
    var dataToUpdate;
    var record;

    if (hasOperators(query)) {
      record = this.data.find(formatForStore(query)).pop();
    } else {
      record = this.data.findObject(query);
    }

    if (!record) {
      return setTimeout(() => {
        callback(null, response);
      }, 0);
    }

    dataToUpdate = copyObject(record);

    if (data.$unset) {
      _.forEach(Object.keys(data.$unset), (key) => {
        delete dataToUpdate[key];
      });
      data = Object.assign(dataToUpdate, _.omit(data, '$unset'));
    }

    if (data.$set) {
      dataToUpdate = _.omit(dataToUpdate, '$set');
      data = Object.assign(dataToUpdate, data.$set);
    }

    data._id = record._id;
    data.meta = record.meta || {};
    if (record['$loki']) {
      data['$loki'] = record['$loki'];
    }

    this.data.update(formatForStore(data));
    response.result.nModified = 1;
    response.result.n = 1;

    setTimeout(() => {
      callback(null, formatForResponse(response));
    }, 0);
  }

  find(query, callback) {
    var result;
    var cursor;

    try {
      if (hasOperators(query)) {
        result = this.data.find(formatForStore(query));
      } else {
        result = this.data.findObjects(formatForStore(query));
      }
      cursor = new FakeCursor(formatForResponse(result));
    } catch (error) {
      return callback(error);
    }

    callback(null, cursor);
  }

  findOne(query, callback) {
    var result;

    try {
      if (this._isObjectId(query)) {
        result = this.data.findObject(formatForStore({_id: query}));
      } else {
        if (hasOperators(query)) {
          result = this.data.find(formatForStore(query))[0];
        } else {
          result = this.data.findObject(formatForStore(query));
        }
      }
    } catch (error) {
      return callback(error);
    }

    callback(null, formatForResponse(result) || null);
  }

  count(query, callback) {
    this.find(query, (error, cursor) => {
      if (error) return callback(error);
      cursor.count(callback);
    });
  }
}

module.exports = FakeCollection;
