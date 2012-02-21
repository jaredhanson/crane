var util = require('util')
  , BufferedAdapter = require('./adapters/bufferedadapter')
  , Job = require('./job');


function Crane() {
}

Crane.prototype.connect = function(options, cb) {
  options = options || {};
  cb = cb || function() {};
  
  var adapter = options.adapter;
  if (typeof adapter == 'string') {
    var mod = require('crane-' + adapter);
    adapter = new mod.Adapter();
  }
  
  this._adapter = new BufferedAdapter(adapter);
  this._adapter.connect(options, cb);
}

Crane.prototype.job = function(type, info, cb) {
  if (typeof info == 'function') {
    cb = info;
    info = undefined;
  }
  cb = cb || function() {};
  
  if (!info) { return this._adapter.create(type, cb); }
  
  var job = new Job(type, info, this);
  return job;
}

Crane.prototype.work =
Crane.prototype.worker = function(queue, fn) {
  this._adapter.dequeue(queue, function(message, shift) {
    var job = new Job(queue, message.info, message.id, this);
    fn(job, function(err) {
      shift();
    });
  });
  return this;
};

Crane.prototype._submit = function(queue, data, cb) {
  cb = cb || function() {};
  this._adapter.enqueue(queue, data, cb);
}


exports = module.exports = new Crane();
