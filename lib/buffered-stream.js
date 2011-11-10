/*
 * buffered-stream.js: A simple(r) Stream which is partially buffered into memory.
 *
 * (C) 2010, Mikeal Rogers
 * 
 * Adapted for Flatiron
 * (C) 2011, Nodejitsu Inc.
 * MIT LICENSE
 *
 */
 
var events = require('events'),
    fs = require('fs'), 
    stream = require('stream'), 
    util = require('util');

//
// ### function BufferedStream (limit)
// #### @limit {number} **Optional** Size of the buffer to limit
// Constructor function for the BufferedStream object responsible for 
// maintaining a stream interface which can also persist to memory 
// temporarily.
//
var BufferedStream = module.exports = function (limit) {
  events.EventEmitter.call(this);
  
  if (typeof limit === 'undefined') {
    limit = Infinity;
  }
  
  this.random = Math.random();
  this.limit = limit;
  this.size = 0;
  this.chunks = [];
  this.writable = true;
  this.readable = true;
};

util.inherits(BufferedStream, events.EventEmitter);

BufferedStream.prototype.pipe = function () {
  var self = this
  var dest = self.dest = arguments[0];
  if (self.resume) {
    self.resume();
  }
  
  stream.Stream.prototype.pipe.apply(self, arguments);
  
  process.nextTick(function () {
    self.chunks.forEach(function (c) { dest.write(c) })
    self.size = 0;
    delete self.chunks;
    
    if (!self.readable) {
      if (self.ended) {
        dest.end();
      }
      else if (self.closed) {
        dest.destroy();
      } 
    }
  });

  if (this.endRecvd) {
    dest.end();
  }
};

BufferedStream.prototype.write = function (chunk) {
  if (this.dest) {
    this.emit('data', chunk);
    return;
  }
  
  this.chunks.push(chunk);
  this.size += chunk.length;
  if (this.limit < this.size) {
    this.pause();
  }
};

BufferedStream.prototype.end = function () {
  this.readable = false;
  this.ended = true;
  this.emit('end');
  this.endRecvd = true;
};

BufferedStream.prototype.close = function () {
  this.readable = false;
  this.closed = true;
};

BufferedStream.prototype.pause = function() {
  this.emit('pause');
};

BufferedStream.prototype.resume = function() {
  this.emit('resume');
};
