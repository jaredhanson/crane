/**
 * Module dependencies.
 */
var Route = require('./route')
  , utils = require('./utils')
  , debug = require('debug')('crane:router')


/**
 * `Router` constructor.
 *
 * @api protected
 */
function Router() {
  var self = this;
  this.arr = [];
  this.caseSensitive = true;
  this.strict = false;

  this.middleware = function router(msg, next) {
    self._dispatch(msg, next);
  };
}

Router.prototype.route = function(queue, fns) {
  var fns = utils.flatten([].slice.call(arguments, 1));
  
  // ensure queue was given
  if (queue === undefined) throw new TypeError('Router.route() requires a queue');
  
  // ensure all handlers are functions
  fns.forEach(function(fn, i){
    if ('function' == typeof fn) return;
    var type = {}.toString.call(fn);
    var msg = 'Router.route() requires callback functions but got a ' + type;
    throw new TypeError(msg);
  });
  
  // create the route
  debug('defined %s', queue);
  var route = new Route(queue, fns, {
    sensitive: this.caseSensitive,
    strict: this.strict
  });
  
  // add it
  this.arr.push(route);
  return this;
};

Router.prototype._dispatch = function(msg, next) {
  debug('dispatching %s (%s)', msg.queue, msg.originalQueue);
  
  var self = this;
  
  // route dispatch
  (function iter(i, err) {
    function nextRoute(err) {
      iter(i + 1, err);
    }
    
    var route = self._match(msg, i);
    if (!route) { return next(err); }
    
    debug('matched %s', route.queue);
    
    // invoke route callbacks
    var idx = 0;
    function callbacks(err) {
      var fn = route.fns[idx++];
      try {
        if ('route' == err) {
          nextRoute();
        } else if (err && fn) {
          if (fn.length < 3) { return callbacks(err); }
          fn(err, msg, callbacks);
        } else if (fn) {
          fn(msg, callbacks);
        } else {
          nextRoute(err);
        }
      } catch (err) {
        callbacks(err);
      }
    }
    callbacks();
  })(0);
}

Router.prototype._match = function(msg, i) {
  var queue = msg.queue
    , routes = this.arr
    , route
    , i = i || 0;
  
  
  // matching routes
  for (var len = routes.length; i < len; ++i) {
    route = routes[i];
    if (route.match(queue, msg.params = [])) {
      return route;
    }
  }
  
  return null;
}

/**
 * Expose `Router`.
 */
module.exports = Router;
