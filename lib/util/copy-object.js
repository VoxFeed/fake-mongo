var _ = require('lodash');

var copyObject = function(source) {
  if (!source) return source;

  var target;

  if(_.isArray(source)) {
    target = _.map(source, (item) => {
      return copyObject(item);
    });

    return target;
  } else if(_.isPlainObject(source)) {
    target = {};

    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        target[key] = copyObject(source[key]);
      }
      else {
        target[key] = source[key];
      }
    });

    return target;
  } else {
    return source;
  }
}

var isObject = function (object) {
  return _.isArray(object) ||  _.isPlainObject(object);
}

module.exports = copyObject;
