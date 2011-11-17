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
    fs = require('fs'),
    HttpStream = require('./http-stream'),
    RoutingStream = require('./routing-stream');
    
var core = exports;

core.createServer = function (options) {
  if (!options) {
    throw new Error('options is required to create a server');
  }
  
  /**
   * Allows the creation of an https server
   * 
   * This adds 3 options:
   * https: (boolean) true / false,
   * key: (string) path/to/key
   * cert: (string) path/to/certificate
   * 
   */
  if (options.https && options.key && options.cert) {
    var certificate = {
        key: fs.readFileSync(options.key),
        cert: fs.readFileSync(options.cert)
    };
    return https.createServer(certificate, function (req, res) {
        var routingStream = new RoutingStream({
        before: options.before,
        after: options.after,
        response: res,
        limit: options.limit
    });
  } else {
    return http.createServer(function (req, res) {
        var routingStream = new RoutingStream({
        before: options.before,
        after: options.after,
        response: res,
        limit: options.limit
    });
  }
    
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