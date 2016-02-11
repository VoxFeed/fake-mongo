'use strict';

var FakeCollection = require('./fake-collection');
var StoreNotValid = require('./errors').StoreNotValid;
var has = require('lodash/object/has');

class DataStore {
  constructor() {
    this.stores = {};
  }

  setStoreName(storeName) {
    if (!storeName) {
      throw new StoreNotValid('The store name ' + storeName + ' is not valid');
    };

    if (!has(this.stores, storeName)) {
      this.stores[storeName] = new FakeCollection(storeName);
    };
  }

  getStore(storeName) {
    if (!storeName) {
      throw new StoreNotValid('The store name ' + storeName + ' is not valid');
    };

    return this.stores[storeName];
  }

  restartStores() {
    delete this.stores;
    this.stores = {};
  }
}

module.exports = DataStore;
