var uuid = require('node-uuid');

/**
 * `Job` constructor.
 *
 * @api public
 */
function Job(type, info, id, base) {
  if (typeof id == 'object') {
    base = id;
    id = uuid.v4();
  }
  
  this.type = type;
  this.id = id;
  this.info = info || {};
  this._base = base;
}

Job.prototype.submit = function(cb) {
  var data = { id: this.id, info: this.info };
  this._base._submit(this.type, data, cb);
}


/**
 * Expose `Job`.
 */
module.exports = Job;
