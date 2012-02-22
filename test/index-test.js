var vows = require('vows');
var assert = require('assert');
var crane = require('crane');
var util = require('util');


vows.describe('crane').addBatch({
  
  'module': {
    'should report a version': function (x) {
      assert.isString(crane.version);
    },
  },

}).export(module);
