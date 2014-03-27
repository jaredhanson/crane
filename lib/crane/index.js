/**
 * Module dependencies.
 */
var proto = require('./worker')
  , util = require('util')
  , utils = require('./utils');


/**
 * Create application.
 *
 * @return {Function}
 * @api public
 */
function create() {
  function app(msg) { app.handle(msg); }
  utils.merge(app, proto);
  app.init();
  for (var i = 0; i < arguments.length; ++i) {
    app.use(arguments[i]);
  }
  return app;
}

/**
 * Expose create() as the module.
 */
exports = module.exports = create;
exports.create = create;
