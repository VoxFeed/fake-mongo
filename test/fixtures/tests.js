var ObjectId = require('bson-objectid');

module.exports = [{
  _id: ObjectId('56bbb4739ab3c2b4b14de00f'),
  name: 'Jon Doe',
  email: 'jon.doe@example.com',
  sex: 'm',
}, {
  name: 'Jane Doe',
  sex: 'f',
  age: 20
}, {
  _id: ObjectId('56bbb4999ab3c2b4b14de010'),
  name: 'Fred Whisley',
  email: 'freddy@example.com',
  sex: 'm',
  age: 28
}, {
  name: 'Alice McAllister',
  email: 'aleez@example.com',
  sex: 'f',
  age: 25
}];
