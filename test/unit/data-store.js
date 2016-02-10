'use strict';

var expect = require('chai').expect;

var DataStore = require('./../../lib/data-store');
var FakeCollection = require('./../../lib/fake-collection');
var StoreNotValid = require('./../../lib/errors').StoreNotValid;

describe('Data Store', () => {
  var dataStore;

  describe('#setStoreName', () => {
    beforeEach(() => {
      dataStore = new DataStore();
    });

    it('throws an error when store name is not sended', (done) => {
      expect(() => {
        dataStore.setStoreName();
      }).to.throw(StoreNotValid);
      done();
    });

    it('set a new item on this.stores with a new fake collection object', (done) => {
      expect(dataStore.getStore('test')).to.be.undefined;
      dataStore.setStoreName('test');
      var store = dataStore.getStore('test');
      expect(store.constructor.name).to.be.equal('FakeCollection');
      done();
    });
  });

  describe('#getStore', () => {
    beforeEach(() => {
      dataStore = new DataStore();
    });

    it('throws an error when store name is not sended', (done) => {
      expect(() => {
        dataStore.getStore();
      }).to.throw(StoreNotValid);
      done();
    });

    it('returns the FakeCollection object related with the store name', (done) => {
      var storeName = 'storeTest';
      dataStore.setStoreName(storeName);
      var fakeCollection = dataStore.getStore(storeName);
      expect(dataStore.stores[storeName]).to.be.deep.equal(fakeCollection);
      done();
    });
  });

  describe('#restartStores', () => {
    beforeEach(() => {
      dataStore = new DataStore();
    });

    it('removes all stores', (done) => {
      dataStore.setStoreName('test');
      dataStore.setStoreName('testStore');
      dataStore.setStoreName('testStoreName');
      dataStore.setStoreName('testStoreNameSomething');

      expect(Object.keys(dataStore.stores).length).to.be.equal(4);
      dataStore.restartStores();
      expect(Object.keys(dataStore.stores).length).to.be.equal(0);
      done();
    });
  });
});
