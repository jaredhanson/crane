var util = require('util')
  , BufferedAdapter = require('./adapters/bufferedadapter')
  , Scheduler = require('./scheduler')
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
  
  this._scheduler = options.scheduler || new Scheduler();
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
    //console.log('MSG: ' + util.inspect(message));
    var job = new Job(message.type, message.id, message.info, this);
    fn(job, function(err) {
      shift();
    });
  });
  return this;
};

Crane.prototype._submit = function(job, cb) {
  cb = cb || function() {};
  if (job.delay()) {
    return this._scheduler.schedule(job, job.delay(), cb);
  }
  this._adapter.enqueue(job.type, job.toJSON(), cb);
}


exports = module.exports = new Crane();

exports.Crane = Crane;
