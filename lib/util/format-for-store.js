var isArray = require('lodash/lang/isArray');
var toPlainObject = require('lodash/lang/toPlainObject');
var isDate = require('lodash/lang/isDate');
var isObjectId = function(obj) {
  return obj.constructor.name.toLowerCase() === 'objectid';
};
var isIterableObject = function(obj) {
  var isObject = typeof obj === 'object';
  return isObject && !isObjectId(obj) && !isDate(obj);
};

var copyObject = function(source) {
  var target = {};
  if (!source) return source;
  if (isArray(source)) return source.map(copyObject);
  if (isIterableObject(source)) {
    Object.keys(toPlainObject(source)).forEach((key) => {
      target[key] = copyObject(source[key]);
    });
    return target;
  }

  if (isObjectId(source)) {
    return '#{ObjectID}' + source.toString();
  }

  return source;
};

module.exports = copyObject;
