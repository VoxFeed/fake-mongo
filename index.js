var FakeDatabase = require('./lib/fake-database');
var FakeCollection = require('./lib/fake-collection');
var ObjectId = require('bson-objectid');
var fakeDatabase;

module.exports = {
  MongoClient: {
    connect(input, callback) {
      if (!fakeDatabase) {
        fakeDatabase = new FakeDatabase();
      }

      callback(null, fakeDatabase);
    }
  },
  ObjectId: ObjectId,
  BSONPure: {
    ObjectID: ObjectId
  },
  Collection: FakeCollection
};
