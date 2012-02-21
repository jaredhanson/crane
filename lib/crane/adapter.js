function Adapter() {
}

Adapter.prototype.connect = function(cb) {
  throw new Error('Adapter#connect unimplemented by adapter');
}

Adapter.prototype.create = function(queue, cb) {
  throw new Error('Adapter#create unimplemented by adapter');
}

Adapter.prototype.enqueue = function(queue, data, cb) {
  throw new Error('Adapter#enqueue unimplemented by adapter');
}

Adapter.prototype.dequeue = function(queue, fn) {
  throw new Error('Adapter#dequeue unimplemented by adapter');
}


module.exports = Adapter;
