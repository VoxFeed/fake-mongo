'use strict';

var DataStore = require('./data-store');

class FakeDatabase {
  constructor() {
    this.store = new DataStore();
  }

  collection(collectionName) {
    //this.store = new DataStore();
    return this.store.getStore(collectionName);
  }

  close(callback) {
    callback();
  }

  dropDatabase(callback) {
    //delete this.store;
    this.store.restartStores();
    callback();
  }
}

module.exports = FakeDatabase;
