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
  
  function requestHandler(req, res) {
    var routingStream = new RoutingStream({
      before: options.before,
      after: options.after,
      request: req,
      response: res,
      limit: options.limit
    });
    
    routingStream.on('error', core.errorHandler);
    req.pipe(routingStream);
  }
  
  if (options.https) {
    if (!options.https.key || !options.https.cert) {
      throw new Error('Both `options.https.key` and `options.https.cert` are required.');
    }
    
    var credentials = {
      key: fs.readFileSync(options.https.key),
      cert: fs.readFileSync(options.https.cert)
    };
    
    if (options.https.ca) {
      credentials.ca = fs.readFileSync(options.https.ca);
    }
    
    return https.createServer(credentials, requestHandler);
  } 
  
  return http.createServer(requestHandler);
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
