/**
 * Module dependencies.
 */
var Router = require('./router')
  , configurable = require('configurable')
  , debug = require('debug')('crane');


/**
 * Application prototype.
 */
var app = exports = module.exports = {};
configurable(app);

app.init = function() {
  this.queue = '';
  this.settings = {};
  this._stack = [];
  this._router = new Router();
  this.defaultConfiguration();
};

app.defaultConfiguration = function(){
  this.set('env', process.env.NODE_ENV || 'development');
  this.set('case sensitive routing', true);
  debug('booting in %s mode', this.get('env'));
  
  // router
  this.__defineGetter__('router', function() {
    this._usedRouter = true;
    this._router.caseSensitive = this.enabled('case sensitive routing');
    this._router.strict = this.enabled('strict routing');
    return this._router.middleware;
  });
};

app.use = function(queue, fn) {
  if ('string' != typeof queue) {
    fn = queue;
    queue = '';
  }
  
  // wrap sub-apps
  if ('function' == typeof fn.handle) {
    var server = fn;
    server.queue = queue;
    fn = function(msg, next) {
      server.handle(msg, next);
    };
  }
  
  // add the middleware
  debug('use %s %s', queue || '#', fn.name || 'anonymous');
  this._stack.push({ queeu: queue, handle: fn });
  return this;
}

app.handle = function(msg, out) {
  var self = this
    , stack = this._stack
    , idx = 0;
  
  // `handle()` can potentially be invoked multiple times, if apps are mounted
  // as sub-apps.  However, only the outer-most app is bound to an underlying
  // message queue.
  //if (this.connection) {
  //  msg.connection = this.connection;
  //}
  
  function next(err) {
    var layer = stack[idx++];
    
    // all done
    if (!layer) {
      // delegate to parent
      if (out) { return out(err); }
      // TODO: Implement default behavior for unhandled messages.
      if (err) {
        console.error(err.stack);
      }
      return;
    }
    
    try {
      // skip this layer if the queue doesn't match, noting that queue names are
      // case sensitive
      if (0 != msg.queue.indexOf(layer.queue)) return next(err);
      
      debug('%s %s', layer.handle.name || 'anonymous', layer.queue);
      var arity = layer.handle.length;
      if (err) {
        if (arity == 3) {
          layer.handle(err, msg, next);
        } else {
          next(err);
        }
      } else if (arity < 3) {
        layer.handle(msg, next);
      } else {
        next();
      }
    } catch (ex) {
      next(ex);
    }
  }
  next();
}
