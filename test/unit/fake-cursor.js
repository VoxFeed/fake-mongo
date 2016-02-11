'use strict';

var async = require('async');
var expect = require('chai').expect;
var ObjectId = require('bson-objectid');

var FakeCursor = require('./../../lib/fake-cursor');
var fixtures = require('./../fixtures/tests');

describe('Fake Cursor', () => {
  var fakeCursor;

  beforeEach(() => {
    fakeCursor = new FakeCursor(fixtures);
  });

  it('#each', (done) => {
    function isLastItem(item) {
      return !item
    };

    fakeCursor.each((error, data) => {
      if (error) return done(error);

      if (isLastItem(data)) return done(null, data)

      expect(data).to.have.ownProperty('name');
    });
  });
});
