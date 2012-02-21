var uuid = require('node-uuid');

/**
 * `Job` constructor.
 *
 * @api public
 */
// TODO: Make id argument the second parameter
function Job(type, info, id, base) {
  if (typeof id == 'object') {
    base = id;
    id = uuid.v4();
  }
  
  this.type = type;
  this.id = id;
  this.info = info || {};
  this._delay = 0;
  this._base = base;
}

Job.prototype.submit = function(cb) {
  this._base._submit(this, cb);
}

Job.prototype.delay = function(ms) {
  if (ms == undefined) { return this._delay; }
  this._delay = ms;
  return this;
}

Job.prototype.toJSON = function() {
  var json = { type: this.type, id: this.id, info: this.info };
  return json;
}


/**
 * Expose `Job`.
 */
module.exports = Job;
