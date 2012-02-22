function BufferedAdapter(adapter) {
  this._adapter = adapter;
  this._buffer = [];
  this._buffering = true;
}

BufferedAdapter.prototype.connect = function(options, cb) {
  var self = this;
  this._adapter.connect(options, function() {
    self._buffering = false;
    self._replay();
    cb();
  });
}

BufferedAdapter.prototype.declare = function(queue, cb) {
  if (!this._buffering) {
    this._adapter.declare(queue, cb);
  } else {
    var args = Array.prototype.slice.call(arguments);
    this._buffer.push(['declare'].concat(args));
  }
}

BufferedAdapter.prototype.enqueue = function(queue, data, cb) {
  if (!this._buffering) {
    this._adapter.enqueue(queue, data, cb);
  } else {
    var args = Array.prototype.slice.call(arguments);
    this._buffer.push(['enqueue'].concat(args));
  }
}

BufferedAdapter.prototype.dequeue = function(queue, fn) {
  if (!this._buffering) {
    this._adapter.dequeue(queue, fn);
  } else {
    var args = Array.prototype.slice.call(arguments);
    this._buffer.push(['dequeue'].concat(args));
  }
}

BufferedAdapter.prototype._replay = function() {
  var self = this;
  this._buffer.forEach(function(args) {
    var method = args.shift();
    self[method].apply(self, args);
  });
}


module.exports = BufferedAdapter;
