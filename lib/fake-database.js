'use strict';

var DataStore = require('./data-store');

class FakeDatabase {
  constructor() {
    this.store = new DataStore();
  }

  collection(collectionName) {
    this.store.setStoreName(collectionName);
    return this.store.getStore(collectionName);
  }

  close(callback) {
    callback();
  }

  dropDatabase(callback) {
    this.store.restartStores();
    callback();
  }
}

module.exports = FakeDatabase;
