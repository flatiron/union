/*
 * core.js: Core functionality for the Flatiron HTTP plugin.
 *
 * (C) 2011, Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var http = require('http'),
    https = require('https'),
    fs = require('fs'),
    stream = require('stream'),
    HttpStream = require('./http-stream'),
    RoutingStream = require('./routing-stream');

var core = exports;

core.createServer = function (options) {
  var isArray = Array.isArray(options.after),
      credentials;

  if (!options) {
    throw new Error('options is required to create a server');
  }

  function requestHandler(req, res) {
    var routingStream = new RoutingStream({
      before: options.before,
      buffer: options.buffer,
      //
      // Remark: without new after is a huge memory leak that
      // pipes to every single open connection
      //
      after: isArray && options.after.map(function (After) {
        return new After;
      }),
      request: req,
      response: res,
      limit: options.limit,
      headers: options.headers
    });

    routingStream.on('error', function (err) {
      var fn = options.onError || core.errorHandler;
      fn(err, routingStream, routingStream.target, function () {
        routingStream.target.emit('next');
      });
    });

    req.pipe(routingStream);
  }

  if (options.https) {
    if (!options.https.key || !options.https.cert) {
      throw new Error('Both `options.https.key` and `options.https.cert` are required.');
    }

    credentials = {
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

core.errorHandler = function error(err, req, res) {
  if (err) {
    (this.res || res).writeHead(err.status || 500, err.headers || { "Content-Type": "text/plain" });
    (this.res || res).end(err.message + "\n");
    return;
  }

  (this.res || res).writeHead(404, {"Content-Type": "text/plain"});
  (this.res || res).end("Not Found\n");
};
