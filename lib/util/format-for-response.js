var isArray = require('lodash/lang/isArray');
var ObjectID = require('bson-objectid');
var toPlainObject = require('lodash/lang/toPlainObject');
var omit = require('lodash/object/omit');
var isDate = require('lodash/lang/isDate');

var isObjectId = function(obj) {
  return typeof obj === 'string' && obj.indexOf('#{ObjectID}') > -1;
};

var isIterableObject = function(obj) {
  var isObject = typeof obj === 'object';
  return isObject && !isObjectId(obj) && !isDate(obj);
};

var isInternalKey = function(key) {
  return ['$loki', 'meta'].indexOf(key) > -1;
};

var copyObject = function(source) {
  var target = Object.assign({}, omit(source, ['_id', '$loki', 'meta']));
  if (!source) return source;
  if (source.meta) {
    target.meta = Object.assign(
      {}, omit(source.meta, ['revision', 'created', 'updated', 'version'])
    );
    if (Object.keys(target.meta).length === 0) {
      delete target.meta;
    }
  }
  if (isArray(source)) return source.map(copyObject);
  if (isIterableObject(source)) {
    Object.keys(toPlainObject(source)).forEach((key) => {
      if (!isInternalKey(key)) {
        target[key] = copyObject(source[key]);
      }
    });
    return target;
  }

  if (isObjectId(source)) {
    return new ObjectID(source.replace('#{ObjectID}', ''));
  }

  return source;
};

module.exports = copyObject;
