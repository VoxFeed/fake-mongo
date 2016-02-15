'use strict';

var async = require('async');
var expect = require('chai').expect;
var ObjectId = require('bson-objectid');

var DataStore = require('./../../lib/data-store');
var FakeCollection = require('./../../lib/fake-collection');
var fixtures = require('./../fixtures/tests');

describe('Fake Collection', () => {
  var fakeCollection;
  var collectionName = 'test';

  describe('#insert', () => {
    beforeEach(() => {
      fakeCollection = new FakeCollection(collectionName);
    });

    it('inserts one single document with id', (done) => {
      var testData = fixtures[0];
      expect(testData._id).to.exist;

      fakeCollection.insert(testData, (error, response) => {
        if (error) return done(error);

        expect(response.result.ok).to.be.equal(1);
        expect(response.result.n).to.be.equal(1);
        expect(response.insertedCount).to.be.equal(1);
        expect(response.ops.length).to.be.equal(1);
        expect(response.insertedIds.length).to.be.equal(1);
        expect(fakeCollection.data[response.insertedIds[0].toString()]._id)
          .to.be.instanceof(ObjectId);
        done();
      });
    });

    it('inserts one single document without id', (done) => {
      var testData = fixtures[1];
      expect(testData._id).to.not.exist;

      fakeCollection.insert(testData, (error, response) => {
        if (error) return done(error);

        expect(response.result.ok).to.be.equal(1);
        expect(response.result.n).to.be.equal(1);
        expect(response.insertedCount).to.be.equal(1);
        expect(response.ops.length).to.be.equal(1);
        expect(response.insertedIds.length).to.be.equal(1);
        expect(fakeCollection.data[response.insertedIds[0].toString()]._id)
          .to.be.instanceof(ObjectId);
        done();
      });
    });

    it('inserts multiple documents ', (done) => {
      fakeCollection.insert(fixtures, (error, response) => {
        if (error) return done(error);

        expect(response.result.ok).to.be.equal(1);
        expect(response.result.n).to.be.equal(4);
        expect(response.insertedCount).to.be.equal(4);
        expect(response.ops.length).to.be.equal(4);
        expect(response.insertedIds.length).to.be.equal(4);
        done();
      });
    });
  });

  describe('#deleteOne', () => {
    beforeEach((done) => {
      fakeCollection = new FakeCollection(collectionName);
      fakeCollection.insert(fixtures, done);
    });

    it('removes document from collection', (done) => {
      var testId = fixtures[0]._id;

      expect(Object.keys(fakeCollection.data).length).to.be.equal(4);

      fakeCollection.deleteOne({_id: testId}, (error, response) => {
        if (error) return done(error);

        expect(response.result.ok).to.be.equal(1);
        expect(response.result.n).to.be.equal(1);
        expect(response.deletedCount).to.be.equal(1);
        expect(Object.keys(fakeCollection.data).length).to.be.equal(3);
        done();
      });
    });

    it('tries to remove from an unexistent id', (done) => {
      var testId = ObjectId();

      expect(Object.keys(fakeCollection.data).length).to.be.equal(4);

      fakeCollection.deleteOne({_id: testId}, (error, response) => {
        if (error) return done(error);

        expect(response.result.ok).to.be.equal(1);
        expect(response.result.n).to.be.equal(0);
        expect(response.deletedCount).to.be.equal(0);
        expect(Object.keys(fakeCollection.data).length).to.be.equal(4);
        done();
      });
    });
  });

  describe('#update', () => {
    const DOCUMET_ID = fixtures[0]._id;

    beforeEach((done) => {
      fakeCollection = new FakeCollection(collectionName);
      fakeCollection.insert(fixtures, done);
    });

    var updateDocument = function (data, callback) {
      var query = {_id: DOCUMET_ID};

      async.waterfall([
        (next) => {
          fakeCollection.findOne(query, next);
        },
        (response, next) => {
          expect(response.name).to.be.equal('Jon Doe');
          expect(response.email).to.be.equal('jon.doe@example.com');
          expect(response.sex).to.be.equal('m');
          expect(response.age).to.not.exist;

          fakeCollection.update(query, data, next);
        },
        (response, next) => {
          expect(response.result.ok).to.be.equal(1);
          expect(response.result.n).to.be.equal(1);
          expect(response.result.nModified).to.be.equal(1);

          fakeCollection.findOne(query, next);
        }
      ], callback);
    }

    it('replaces data when it updates', (done) => {
      var newData = {
        name: 'Fred Kingsley',
        age: 30
      };


      updateDocument(newData, (error, data) => {
        if (error) return done(error);

        expect(data.name).to.be.equal('Fred Kingsley');
        expect(data.email).to.not.exist;
        expect(data.sex).to.not.exist;
        expect(data.age).to.be.equal(30);
        done();
      });
    });

    it('update only data sent', (done) => {
      var newData = {
        $set: {
          name: 'Fred Kingsley',
          age: 30
        }
      };

      updateDocument(newData, (error, data) => {
        if (error) return done(error);

        expect(data.name).to.be.equal('Fred Kingsley');
        expect(data.email).to.be.equal('jon.doe@example.com');
        expect(data.sex).to.be.equal('m');
        expect(data.age).to.be.equal(30);
        done();
      });
    });

    it('update only data sent when key $set is string', (done) => {
      var newData = {
        '$set': {
          name: 'Fred Kingsley',
          age: 30
        }
      };

      updateDocument(newData, (error, data) => {
        if (error) return done(error);

        expect(data.name).to.be.equal('Fred Kingsley');
        expect(data.email).to.be.equal('jon.doe@example.com');
        expect(data.sex).to.be.equal('m');
        expect(data.age).to.be.equal(30);
        done();
      });
    });

    it('remove some data ', (done) => {
      var newData = {
        $unset: {
          name: '',
          email: 0
        }
      };

      updateDocument(newData, (error, data) => {
        if (error) return done(error);

        expect(data.name).to.not.exist;
        expect(data.email).to.not.exist;
        expect(data.sex).to.be.equal('m');
        expect(data._id).to.exist;
        expect(data.age).to.not.exist;
        done();
      });
    });

    it('remove  and update some data', (done) => {
      var newData = {
        $unset: {
          email: 0
        },
        $set: {
          name: 'Jack Kirby'
        }
      };

      updateDocument(newData, (error, data) => {
        if (error) return done(error);

        expect(data.name).to.be.equal('Jack Kirby');
        expect(data.email).to.not.exist;
        expect(data.sex).to.be.equal('m');
        expect(data._id).to.exist;
        expect(data.age).to.not.exist;
        done();
      });
    });

    it('tries to remove unexistent document', (done) => {
      var data = {
        name: 'Richard',
        age: 25
      };

      fakeCollection.update({_id: ObjectId()}, data, (error, response) => {
        if (error) return done(error)

        expect(response.result.ok).to.be.equal(1);
        expect(response.result.n).to.be.equal(0);
        expect(response.result.nModified).to.be.equal(0);
        done();
      });
    });
  });

  describe('#find', () => {
    beforeEach((done) => {
      fakeCollection = new FakeCollection(collectionName);
      fakeCollection.insert(fixtures, done);
    });

    it('get all documents', (done) => {
      fakeCollection.find({}, (error, cursor) => {
        if (error) return done(error);

        expect(cursor.toArray().length).to.be.equal(fixtures.length);
        done();
      });
    });

    it('gets document by query', (done) => {
      var documentId = fixtures[2]._id
      fakeCollection.find({_id: documentId}, (error, cursor) => {
        if (error) return done(error);

        var response = cursor.toArray();
        expect(response.length).to.be.equal(1);
        expect(response[0]._id).to.be.equal(documentId);
        done();
      });
    });
  });

  describe('#findOne', () => {
    beforeEach((done) => {
      fakeCollection = new FakeCollection(collectionName);
      fakeCollection.insert(fixtures, done);
    });

    it('gets document by id', (done) => {
      var documentId = fixtures[2]._id;

      fakeCollection.findOne(documentId, (error, data) => {
        expect(data).to.be.deep.equal(fixtures[2]);
        done();
      });
    });

    it('get one document by query', (done) => {
      var query = {name: 'Jon Doe'}

      fakeCollection.findOne(query, (error, data) => {
        if (error) return done(error);

        expect(data.name).to.be.equal(query.name);
        expect(data).to.be.deep.equal(fixtures[0]);
        done();
      });
    });

    it('gets null with unexistent document', (done) => {
      fakeCollection.findOne({name: 'Charles'}, (error, data) => {
        if (error) return done(error);

        expect(data).to.be.null;
        done();
      });
    });

    it('gets null with unexistent id', (done) => {
      fakeCollection.findOne(ObjectId(), (error, data) => {
        if (error) return done(error);

        expect(data).to.be.null;
        done();
      });
    });
  });

  describe('#count', () => {
    beforeEach((done) => {
      fakeCollection = new FakeCollection(collectionName);
      fakeCollection.insert(fixtures, done);
    });

    it('counts all documents', (done) => {
      fakeCollection.count({}, (error, count) => {
        if (error) return done(error);

        expect(count).to.be.equal(fixtures.length);
        done();
      });
    });

    it('counts document by query', (done) => {
      var documentId = fixtures[2]._id
      fakeCollection.count({_id: documentId}, (error, count) => {
        if (error) return done(error);

        expect(count).to.be.equal(1);
        done();
      });
    });
  });
});
