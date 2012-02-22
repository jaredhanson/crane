var uuid = require('node-uuid')
  , util = require('util')
  , FixedBackoff = require('./retry/fixedbackoff');

/**
 * `Job` constructor.
 *
 * @api public
 */
function Job(type, id, info, base) {
  if (!base) {
    base = info;
    info = id;
    id = uuid.v4();
  }
  
  this.type = type;
  this.id = id;
  this.info = info || {};
  this._delay = 0;
  this._retry = new FixedBackoff();
  this._base = base;
}

Job.prototype.submit = function(cb) {
  if (this.attempt === undefined) {
    this.attempt = 0;
  } else {
    this.attempt++;
  }
  this._base._submit(this, cb);
}

Job.prototype.retry = function(err) {
  var self = this;
  this._retry.should(this.attempt, function(e, ms) {
    if (e) { return self.error(e); }
    if (ms === false) { return self.fail(err); }
    self.delay(ms).submit();
  });
}

Job.prototype.done = function() {
  this.attempt++;
};

Job.prototype.fail = function(err) {
  this.attempt++;
};

Job.prototype.error = function(err) {
};

Job.prototype.delay = function(ms) {
  if (ms == undefined) { return this._delay; }
  this._delay = ms;
  return this;
}

Job.prototype.attempts = function(options) {
  if (typeof options == 'number') {
    options = { count: options - 1 };
  }
  options = options || {};
  
  this._retry = new FixedBackoff(options);
  return this;
}

Job.prototype.toJSON = function() {
  var json = {       id: this.id,
                   info: this.info,
               attempts: this.attempt,
                  retry: this._retry.toJSON() };
  return json;
}


/**
 * Expose `Job`.
 */
module.exports = Job;
