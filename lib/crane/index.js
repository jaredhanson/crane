/**
 * Module dependencies.
 */
var util = require('util')
  , BufferedAdapter = require('./adapters/bufferedadapter')
  , Scheduler = require('./scheduler')
  , Job = require('./job');


/**
 * `Crane` constructor.
 *
 * @api public
 */
function Crane() {
}

/**
 * Connects `Crane` to the message queue, and initializes with the given
 * `options`.
 *
 * Initializes `Crane` and connects it to the underlying message queue using the
 * given adapter.  `options` will be passed through to the adapter's `connect()`
 * function.  Once connected to the message queue, the callback function `cb` will
 * be invoked.
 *
 * It is safe to submit jobs and register workers before the connection is
 * established, as operations will be buffered and sent when the connection is
 * ready.
 *
 * Options:
 *   - `adapter`    Use given message queue adapter.  If specified as a string,
 *                  the module will be `require()`'d, and expects `Adapter` to
 *                  be exported.
 *   - `scheduler`  Use given scheduler, in place of default scheduler
 *
 * Examples:
 *
 *     crane.connect({ adapter: 'amqp', host: '127.0.0.1' });
 *
 *     var adapter = new Adapter();
 *     crane.connect({ adapter: adapter, host: '172.16.176.175' });
 *
 *     crane.connect({ adapter: 'amqp', host: '127.0.0.1' }, function() {
 *       // connection is ready
 *     });
 *
 * @param {Object} options
 * @param {Function} callback
 * @return {Crane} (chainable)
 * @api public
 */
Crane.prototype.connect = function(options, cb) {
  options = options || {};
  cb = cb || function() {};
  
  var adapter = options.adapter;
  if (typeof adapter == 'string') {
    var mod = require('crane-' + adapter);
    adapter = new mod.Adapter();
  }
  
  this._scheduler = options.scheduler || new Scheduler();
  
  // Wrap the adapter in a `BufferedAdapter`.  This is a convienience which
  // allows the application to invoke functions before the underlying connection
  // is established.
  this._adapter = new BufferedAdapter(adapter);
  this._adapter.connect(options, cb);
  return this;
}

/**
 * Declare a job type or create a new job.
 *
 * If passed a `type` and optional callback function `cb`, declares a job queue
 * of the given type.  Declaring a job queue creates the necessary queues in the
 * underlying message queue.  When the queues are ready, callback function `cb`
 * is invoked.
 *
 *     crane.job('email', function() {
 *       // email queue is ready
 *       submitEmailJobs();
 *     });
 *
 * It is important to wait until queues are ready before attempting to submit
 * jobs.  Any attempt to submit a job before a queue is ready may result in that
 * job being lost.
 *
 * If passed a `type` and `info`, creates a new job that can be submitted to
 * the queue.
 *
 *     var job = crane.job('email', { to: 'john@example.com', message: 'Hello' });
 *     job.submit();
 *
 * @param {String} type
 * @param {Object|Function} info|cb
 * @return {Job}
 * @api public
 */
Crane.prototype.job = function(type, info, cb) {
  if (typeof info == 'function') {
    cb = info;
    info = undefined;
  }
  cb = cb || function() {};
  
  if (!info) { return this._adapter.declare(type, cb); }
  
  var job = new Job(type, info, this);
  return job;
}

/**
 * Register a worker for the given job `type`.
 *
 * A worker function must accept two arguments, `job` and `done`.  Information
 * pertaining to the job is available via `job.info`.  When the job is complete,
 * the worker must invoke `done`, optionally passing an `err` is an error
 * occured.
 *
 * Examples:
 *
 *     crane.work('email', function(job, done) {
 *       var to = job.info.to;
 *       var message = job.info.message;
 *       email(to, message, function(err) {
 *         if (err) { return done(err) }
 *         return done();
 *       });
 *     });
 *
 * @param {String} type
 * @param {Function} fn
 * @return {Crane} (chainable)
 * @api public
 */
Crane.prototype.work =
Crane.prototype.worker = function(type, fn) {
  var self = this;
  this._adapter.dequeue(type, function(message, shift) {
    //console.log('MSG: ' + util.inspect(message));
    var job = new Job(type, message.id, message.info, self);
    job.attempt = message.attempts;
    job.attempts(message.retry);
    
    fn(job, function(err) {
      if (err) { job.retry(err); }
      else { job.done(); }
      
      // The job has been fully processed.  `shift()` is called to complete the
      // transaction and remove the job from the queue.
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


/**
 * Export default singleton.
 *
 * @api public
 */
exports = module.exports = new Crane();

/**
 * Framework version.
 */
require('pkginfo')(module, 'version');

/**
 * Expose constructors.
 */
exports.Crane = Crane;
