/*
 * response-stream.js: A Stream focused on writing any relevant information to 
 * a raw http.ServerResponse object.
 *
 * (C) 2011, Nodejitsu Inc.
 * MIT LICENSE
 *
 */
 
var util = require('util'),
    HttpStream = require('./http-stream');

//
// ### function RequestStream (options) 
// 
//  
var ResponseStream = module.exports = function (options) {
  options = options || {};
  HttpStream.call(this, options);
  
  this.writeable = true;
  this.response = options.response;
  
  if (options.headers) {
    for (var key in options.headers) {
      this.response.setHeader(key, options.headers[key]);
    }
  }
};

util.inherits(ResponseStream, HttpStream);

ResponseStream.prototype.writeHead = function (statusCode, headers) {
  if (headers) {
    for (var key in headers) {
      this.response.setHeader(key, headers[key]);
    }
  }
  
  this.response.statusCode = statusCode;
};

//
// Create pass-thru for the necessary 
// `http.ServerResponse` methods.
//
['setHeader', 'getHeader', 'removeHeader'].forEach(function (method) {
  ResponseStream.prototype[method] = function () {
    return this.response[method].apply(this.response, arguments);
  };
});

ResponseStream.prototype.json = function (obj) {
  if (!this.response.writable) {
    return;
  }
  
  if (typeof obj === 'number') {
    this.response.statusCode = obj;
    obj = arguments[1];
  }  
  
  this.response.setHeader('content-type', 'application/json');
  this.response.end(obj ? JSON.stringify(obj) : '');
};

ResponseStream.prototype.end = function (data) {
  if (data && this.writable) {
    this.emit('data', data);
  }
  
  this.modified = true;
  this.emit('end');
};

ResponseStream.prototype.write = function (data) {
  this.modified = true;
  
  if (this.writable) {
    this.emit('data', data);
  }
};