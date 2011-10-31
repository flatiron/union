/*
 * core.js: Core functionality for the Flatiron HTTP plugin. 
 *
 * (C) 2011, Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var http = require('http'),
    https = require('https'),
    stream = require('stream'),
    HttpStream = require('./http-stream'),
    RoutingStream = require('./routing-stream');
    
var core = exports;

core.createServer = function (options) {
  var streams = Array.prototype.slice.call(arguments).filter(function (str) {
    return typeof str === 'function';
  });
  
  if (typeof options === 'function') {
    options = {};
  }
  
  //
  // TODO: Create HTTPS server is `options` is present.
  //
  return http.createServer(core.stack(streams));
}

core.stack = function stack(/*streams*/) {
  var middleware = Array.prototype.slice.call(arguments),
      error = core.errorHandler;
    
  return function (req, res) {
    var routingStream = new RoutingStream(middleware, res),
    routingStream.on('error', error);
    req.pipe(routingStream);
  };
};

core.errorHandler = function error(err) {
  if (err) {
    console.error(err.stack);
    this.res.writeHead(500, {"Content-Type": "text/plain"});
    this.res.end(err.stack + "\n");
    return;
  }
  this.res.writeHead(404, {"Content-Type": "text/plain"});
  this.res.end("Not Found\n");
};