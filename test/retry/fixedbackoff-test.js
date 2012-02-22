var vows = require('vows');
var assert = require('assert');
var util = require('util');
var FixedBackoff = require('crane/retry/fixedbackoff');


vows.describe('FixedBackoff').addBatch({
  
  'default': {
    topic: function() {
      return new FixedBackoff();
    },
    
    'should serialize to JSON': function (retry) {
      var json = retry.toJSON();
      assert.strictEqual(json.count, 0);
      assert.strictEqual(json.interval, 0);
    },
    
    'asking to retry after initial attempt': {
      topic: function(retry) {
        var self = this;
        retry.should(0, function(err, ms) {
          self.callback(err, ms);
        });
      },
      
      'should not generate an error' : function(err, ms) {
        assert.isNull(err);
      },
      'should not retry' : function(err, ms) {
        assert.isFalse(ms);
      },
    },
  },
  
  'retry twice with no delay': {
    topic: function() {
      return new FixedBackoff({ count: 2, interval: 0 });
    },
    
    'should serialize to JSON': function (retry) {
      var json = retry.toJSON();
      assert.strictEqual(json.count, 2);
      assert.strictEqual(json.interval, 0);
    },
    
    'asking to retry after initial attempt': {
      topic: function(retry) {
        var self = this;
        retry.should(0, function(err, ms) {
          self.callback(err, ms);
        });
      },
      
      'should not generate an error' : function(err, ms) {
        assert.isNull(err);
      },
      'should retry immediately' : function(err, ms) {
        assert.strictEqual(ms, 0);
      },
    },
    
    'asking to retry after first retry attempt': {
      topic: function(retry) {
        var self = this;
        retry.should(1, function(err, ms) {
          self.callback(err, ms);
        });
      },
      
      'should not generate an error' : function(err, ms) {
        assert.isNull(err);
      },
      'should retry immediately' : function(err, ms) {
        assert.strictEqual(ms, 0);
      },
    },
    
    'asking to retry after second retry attempt': {
      topic: function(retry) {
        var self = this;
        retry.should(2, function(err, ms) {
          self.callback(err, ms);
        });
      },
      
      'should not generate an error' : function(err, ms) {
        assert.isNull(err);
      },
      'should not retry' : function(err, ms) {
        assert.isFalse(ms);
      },
    },
  },
  
  'retry twice with delay': {
    topic: function() {
      return new FixedBackoff({ count: 2, interval: 30000 });
    },
    
    'should serialize to JSON': function (retry) {
      var json = retry.toJSON();
      assert.strictEqual(json.count, 2);
      assert.strictEqual(json.interval, 30000);
    },
    
    'asking to retry after initial attempt': {
      topic: function(retry) {
        var self = this;
        retry.should(0, function(err, ms) {
          self.callback(err, ms);
        });
      },
      
      'should not generate an error' : function(err, ms) {
        assert.isNull(err);
      },
      'should retry after 30 seconds' : function(err, ms) {
        assert.strictEqual(ms, 30000);
      },
    },
    
    'asking to retry after first retry attempt': {
      topic: function(retry) {
        var self = this;
        retry.should(1, function(err, ms) {
          self.callback(err, ms);
        });
      },
      
      'should not generate an error' : function(err, ms) {
        assert.isNull(err);
      },
      'should retry after 30 seconds' : function(err, ms) {
        assert.strictEqual(ms, 30000);
      },
    },
    
    'asking to retry after second retry attempt': {
      topic: function(retry) {
        var self = this;
        retry.should(2, function(err, ms) {
          self.callback(err, ms);
        });
      },
      
      'should not generate an error' : function(err, ms) {
        assert.isNull(err);
      },
      'should not retry' : function(err, ms) {
        assert.isFalse(ms);
      },
    },
  },

}).export(module);
