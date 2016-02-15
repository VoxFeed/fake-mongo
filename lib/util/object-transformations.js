'use strict';

var camelCase = require('lodash/string/camelCase');
var snakeCase = require('lodash/string/snakeCase');
var isPlainObject = require('lodash/lang/isPlainObject');
var merge = require('deepmerge');
var BadInputError = require('./../errors').BadInputError;

var keysIteratee = function(object, iterator) {
  Object.keys(object).forEach(iterator);
};

var transformObjectKeys = function(toTransform, transformation) {
  var transformed = {};

  if (!isPlainObject(toTransform)) {
    throw new BadInputError('input must be a plain object');
  }

  keysIteratee(toTransform, (key) => {
    transformed[transformation(key)] = toTransform[key];
  });

  return transformed;
};

var wrap = function(key, obj) {
  let wrapped = {};
  wrapped[key] = obj;
  return wrapped;
};

var buildObjectFromDotNotation = function(dotNotation, value) {
  var keys = dotNotation.split('.');
  var res = {};
  res[keys.pop()] = value;
  while (keys.length) {
    res = wrap(keys.pop(), res);
  }
  return res;
};

module.exports = exports = {};

exports.camelizeObject = function(toCamelize) {
  return transformObjectKeys(toCamelize, camelCase);
};

exports.snakeizeObject = function(toSnakeize) {
  return transformObjectKeys(toSnakeize, snakeCase);
};

exports.evaluateDotNotationObject = function(toEval) {
  var pattern = /\./;
  var res = {};

  Object.keys(toEval).forEach((key) => {
    if (pattern.test(key)) {
      let constructedObject = buildObjectFromDotNotation(key, toEval[key]);
      res = merge(res, constructedObject);
    } else {
      res[key] = toEval[key];
    }
  });

  return res;
};
