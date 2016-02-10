'use strict';

var FakeCollection = require('./fake-collection');

class StoreNotFound extends Error {
  constructor(message) {
    if (!message) {
      message = 'The store was not found in the database';
    }

    super(message);
    this.name = 'StoreNotFoundError';
    Error.captureStackTrace(this, this.constructor);
  }
}

class DataStore {
  constructor() {
    this.stores = this.initializeDataWithStores();
  }

  initializeDataWithStores() {
    var stores = [
      'accounts', 'socialnetworkaccounts', 'profits',
      'schedules', 'users', 'socialnetworkmessages',
      'paymentouts'
    ];
    var data = [];

    for (var i = 0; i < stores.length; i++) {
      data[stores[i]] = new FakeCollection(stores[i]);
    }

    return data;
  }

  getStore(storeName) {
    if (!this.stores[storeName]) {
      throw new StoreNotFound('The store was not found in the database');
    }

    return this.stores[storeName];
  }

  restartStores() {
    delete this.stores;
    this.stores = this.initializeDataWithStores();
  }
}

module.exports = DataStore;
