/*
 * index.js: Top-level plugin exposing HTTP features in flatiron
 *
 * (C) 2011, Nodejitsu Inc.
 * MIT LICENSE
 *
 */
 
var http = exports;

http.BufferedStream = require('./buffered-stream');
http.HttpStream     = require('./http-stream');
http.ResponseStream = require('./response-stream');
http.RoutingStream  = require('./routing-stream');
http.createServer   = require('./core').createServer;

try {
  //
  // Attempt to progressively enhance the flatiron object by 
  // adding ourselves to the plugins
  //
  var flatiron = require('flatiron');
  flatiron.plugins.http = http;
}
catch (ex) {
  //
  // Do nothing since this is a progressive enhancement
  //
}