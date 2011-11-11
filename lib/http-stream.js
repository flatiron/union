/*
 * http-stream.js: Idomatic buffered stream which pipes additional HTTP information.
 *
 * (C) 2011, Nodejitsu Inc.
 * MIT LICENSE
 *
 */
 
var url = require('url'),
    util = require('util'),
    BufferedStream = require('morestreams').BufferedStream;
    
var HttpStream = module.exports = function (options) {
  options = options || {};
  BufferedStream.call(this, options.limit);
  
  this.on('pipe', this.pipeState);
};

util.inherits(HttpStream, BufferedStream);

//
// ### function pipeState (source)
// #### @source {ServerRequest|HttpStream} Source stream piping to this instance
// Pipes additional HTTP metadata from the `source` HTTP stream (either concrete or
// abstract) to this instance. e.g. url, headers, query, etc.
//
// Remark: Is there anything else we wish to pipe?
//
HttpStream.prototype.pipeState = function (source) {
  this.url = source.url;
  this.headers = source.headers;
  this.method = source.method;

  if (source.query) {
    this.query = source.query;
  }
  else {
    this.query = ~source.url.indexOf('?')
      ? qs.parse(url.parse(source.url).query)
      : {};
  }
};
