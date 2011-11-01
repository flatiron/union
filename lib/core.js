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
  if (!options) {
    throw new Error('options is required to create a server');
  }
  
  //
  // TODO: Create HTTPS server is `options` is present.
  //
  return http.createServer(function (req, res) {
    console.log(req.method + ': ' + req.url);
    var routingStream = new RoutingStream({
      use: options.use,
      useAfter: options.useAfter,
      router: options.router,
      response: res,
      limit: options.limit
    });
    
    routingStream.on('error', core.errorHandler);
    req.pipe(routingStream);
  });
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