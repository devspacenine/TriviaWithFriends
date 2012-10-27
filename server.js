/* Dependencies */
var events = require('events'),
express = require('express'),
sugar = require('sugar');

global.app = express();
app.set('root', __dirname);

require('./lib/setup').setup({
    mongoose: require('mongoose'),
    mongodb: require('mongodb'),
    express: express,
    ie_regex: new RegExp("^msie.*", "gi"),
    today: new Date()
});
