/*
 * routing-stream.js: A Stream focused on connecting an arbitrary RequestStream and
 * ResponseStream through a given Router.
 *
 * (C) 2011, Nodejitsu Inc.
 * MIT LICENSE
 *
 */
 
var util = require('util'),
    RequestStream = require('./request-stream'),
    ResponseStream = require('./response-stream');

//
// ### function RequestStream (options) 
// 
//  
var RoutingStream = module.exports = function (options) {
  options = options || {};
  RequestStream.call(this, options);
  
  this.use = options.use || [];
  this.useAfter = options.useAfter || [];
  this.response = options.response || options.res;
  this.router = options.router;
  this.target = new ResponseStream({ 
    response: this.response
  });
  
  this.once('pipe', this.route);
};

util.inherits(RoutingStream, RequestStream);

//
// Called when this instance is piped to **by another stream**
//
RoutingStream.prototype.route = function (req) {
  //
  // When a `RoutingStream` is piped to:
  //
  // 1. Setup the pipe-chain between the `useAfter` middleware, the abstract response
  //    and the concrete response. 
  // 2. Attempt to dispatch to the `use` middleware, which represent things such as 
  //    favicon, static files, etc. 
  // 3. Check the Router associated with this instance. If it is not configured
  //    to `{ stream: true }` for the specified URL, then parse the body stream. 
  // 4. Attempt to dispatch to the Router. If no match is found then pipe to the 404Stream
  //
  var self = this,
      after,
      i;
      
  //
  // Don't allow `this.target` to be writable on HEAD requests
  //
  this.target.writable = req.method !== 'HEAD';
  
  //
  // 1. Setup the pipe-chain between the `useAfter` middleware, the abstract response
  //    and the concrete response.
  //
  after = [this.target].concat(this.useAfter, this.response);
  for (i = 0; i < after.length - 1; i++) {
    after[i].pipe(after[i + 1]);
    after[i].on('error', this.onError);
  }
  
  //
  // Helper function for dispatching to the Router associated with this instance.
  //
  function route() {
    if (!self.router.dispatch(self, self.target)) {
      //
      // TODO: Pipe to the 404 stream
      //
    }
  }
  
  //
  // 2. Attempt to dispatch to the `use` middleware, which represent things such as 
  //    favicon, static files, etc. 
  //
  (function dispatch(i) {
    if (++i === self.use.length) {
      //
      // 3. Check the Router associated with this instance. If it is not configured
      //    to `{ stream: true }` for the specified URL, then parse the body stream. 
      //
      return route();
    }
    else if (self.target.modified) {
      return;
    }
    
    self.target.once('next', dispatch.bind(null, i));
    
    if (self.use[i].length === 3) {
      self.use[i](self, self.target, function () {
        self.target.emit('next');
      });
    }
    else {
      self.use[i](self, self.target);
    }
  })(-1);  
};

RoutingStream.prototype.onError = function (err) {
  this.emit('error', err);
};