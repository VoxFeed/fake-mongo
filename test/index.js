'use strict';

// Tests will always run on test environment;
var chai = require('chai');
var sinonChai = require('sinon-chai');
var paths = require('app-module-path');

chai.use(sinonChai);

paths.addPath(__dirname + '/../lib');
paths.addPath(__dirname + '/../tests');
