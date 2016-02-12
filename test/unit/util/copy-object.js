var copyObject = require('./../../../lib/util/copy-object');
var expect = require('chai').expect;

describe('Copy Object', () => {
  it('copies a plain object', () => {
    var plainObject = {
      name: 'John Doe',
      age: 33,
      sex: 'm'
    };

    var objectCopied = copyObject(plainObject);
    expect(objectCopied).to.be.deep.equal(plainObject);
  });

  it('copies a plain object with an array of non-objects inside', () => {
    var plainObject = {
      name: 'John Doe',
      age: 33,
      sex: 'm',
      arrayTest: [1, 2, 3, 4]
    };

    var objectCopied = copyObject(plainObject);
    expect(objectCopied).to.be.deep.equal(plainObject);
  });

  it('copies a plain object with an array of objects inside', () => {
    var plainObject = {
      name: 'John Doe',
      age: 33,
      sex: 'm',
      arrayTest: [{
        item1: 1,
        item2: 'test'
      }, {
        item4: [1,2,3],
        item1: {item5:5},
      }]
    };

    var objectCopied = copyObject(plainObject);
    expect(objectCopied).to.be.deep.equal(plainObject);
  });

  it('copies an array of non-objects', () => {
    var array = [1,2,3]

    var arrayCopied = copyObject(array);
    expect(arrayCopied).to.be.deep.equal(array);
  });

  it('copies an array of objects', () => {
    var array = [{
      name: 'John Doe',
      age: 33,
      sex: 'm'
    }, {
      name: 'John Doe',
      age: 33,
      sex: 'm',
      arrayTest: [1, 2, 3, 4]
    }, {
      name: 'John Doe',
      age: 33,
      sex: 'm',
      arrayTest: [{
        item1: 1,
        item2: 'test'
      }, {
        item4: [1,2,3],
        item1: {item5:5},
      }]
    }];

    var arrayCopied = copyObject(array);
    expect(arrayCopied).to.be.deep.equal(array);
  });
});
