var config = require('config');
var thinky = require('thinky')(config.rethink);
module.exports = thinky;
