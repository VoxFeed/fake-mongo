'use strict';

class StoreNotValid extends Error {
  constructor(message) {
    if (!message) {
      message = 'The store is not valid';
    }

    super(message);
    this.name = 'StoreNotValid';
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports.StoreNotValid = StoreNotValid;
