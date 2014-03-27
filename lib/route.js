/**
 * Module dependencies.
 */
var pattern = require('urlpattern').express;


/**
 * `Route` constructor.
 *
 * @api protected
 */
function Route(topic, fns, options) {
  options = options || {};
  this.topic = topic;
  this.fns = fns;
  this.regexp = pattern.parse(topic
    , this.keys = []
    , options.sensitive
    , options.strict);
}

Route.prototype.match = function(topic, params) {
  params = params || [];
  
  var keys = this.keys
    , m = this.regexp.exec(topic);
  
  if (!m) return false;
  
  for (var i = 1, len = m.length; i < len; ++i) {
    var key = keys[i - 1]
      , val = m[i];
    if (key) {
      params[key.name] = val;
    } else {
      params.push(val);
    }
  }
  return true;
};

/**
 * Expose `Route`.
 */
module.exports = Route;
