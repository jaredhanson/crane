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
  var self = this;
  this._adapter.dequeue(queue, function(message, shift) {
    //console.log('MSG: ' + util.inspect(message));
    var job = new Job(message.type, message.id, message.info, self);
    job.attempts(message.retry);
    job._attempt = message.attempts;
    
    fn(job, function(err) {
      // The job has been fully processed.  `shift()` is called to fully remove
      // the job from the queue, regardless of status.  If the job has failed,
      // and retry attempts remain, it will be resubmitted to the queue.
      shift();
      
      if (err) { return job.retry(err); }
      job.done();
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
