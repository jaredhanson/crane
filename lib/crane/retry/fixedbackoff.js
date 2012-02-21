function FixedBackoff(options) {
  options = options || {};
  this.count = options.count || 0;
  this.interval = options.interval || 0;
}

FixedBackoff.prototype.should = function(attempt, fn) {
  if (attempt < this.count) { return fn(null, this.interval); }
  return fn(null, false);
}

FixedBackoff.prototype.toJSON = function() {
  var json = { count: this.count, interval: this.interval };
  return json;
}


module.exports = FixedBackoff;
