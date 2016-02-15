'use strict';

var transformations = require('./../../../lib/util/object-transformations');
var expect = require('chai').expect;

describe('Object Trasnformations Util', () => {
  describe('Evaluate dot notation object', () => {
    it('transforms correctly a simple object', () => {
      const EXPECTED_DEEP_VALUE = 'A dot B value';
      const EXPECTED_ROOT_VALUE = 'C value';
      const source = {
        'a.b': EXPECTED_DEEP_VALUE,
        c: EXPECTED_ROOT_VALUE
      };

      let result = transformations.evaluateDotNotationObject(source);
      expect(result).to.have.property('c', EXPECTED_ROOT_VALUE);
      expect(result).to.have.deep.property('a.b', EXPECTED_DEEP_VALUE);
    });

    it('transforms correctly an object with potential overrides', () => {
      const EXPECTED_DEEP_VALUE_1 = 'A dot B value';
      const EXPECTED_DEEP_VALUE_2 = 'A dot C value';
      const source = {
        'a.b': EXPECTED_DEEP_VALUE_1,
        'a.c': EXPECTED_DEEP_VALUE_2
      };

      let result = transformations.evaluateDotNotationObject(source);
      expect(result).to.have.deep.property('a.b', EXPECTED_DEEP_VALUE_1);
      expect(result).to.have.deep.property('a.c', EXPECTED_DEEP_VALUE_2);
    });
  });
});
