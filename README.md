# union [![Build Status](https://secure.travis-ci.org/flatiron/union.png)](http://travis-ci.org/flatiron/union)

A hybrid buffered / streaming middleware kernel backwards compatible with connect.

## Example

``` js
var fs = require('fs'),
    union = require('../lib'),
    director = require('director'),
    favicon = require('./middleware/favicon');

var router = new director.http.Router();

var server = union.createServer({
  before: [
    favicon('./favicon.png'),
    function (req, res) {
      var found = router.dispatch(req, res);
      if (!found) {
        res.emit('next');
      }
    }
  ]
});

router.get(/foo/, function () {
  this.res.writeHead(200, { 'Content-Type': 'text/plain' })
  this.res.end('hello world\n');
});

router.post(/foo/, { stream: true }, function () {
  var req = this.req,
      res = this.res,
      writeStream;
      
  writeStream = fs.createWriteStream(Date.now() + '-foo.txt');
  req.pipe(writeStream);
  
  writeStream.on('close', function () {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('wrote to a stream!');
  });
});

server.listen(9090);
console.log('union with director running on 9090');
```

## Installation

### Installing npm (node package manager)
``` bash
  $ curl http://npmjs.org/install.sh | sh
```

### Installing union
``` bash 
  $ [sudo] npm install union
````

## Usage:

### union.createServer(options)

The `options` object is required. Options include:

#### options.before

`options.before` is an array of middlewares, which are used to route and serve incoming requests. For instance, in the example, `favicon` is a middleware which handles requests for `/favicon.ico`.

Union's request handling is [connect](https://github.com/senchalabs/connect)-compatible, meaning that all existing connect middlewares should work out-of-the-box with union.

In addition, the response object passed to middlewares listens for a "next" event, which is equivalent to calling `next()`. Flatiron middlewares are written in this manner, meaning they are not reverse-compatible with connect.

#### options.after

`options.after` is an array of stream filters, which are applied after the request handlers in `options.before`. Stream filters inherit from `union.ResponseStream`, which implements the Node.js core streams api with a bunch of other goodies.

The advantage to streaming middlewares is that they do not require buffering the entire stream in order to execute their function.

#### options.limit (*optional*)

This argument is passed to internal instantiations of `union.BufferedStream`.

#### options.https (*optional*)

This argument specifies the certificate and key necessary to create an instance of `https.Server`:

``` js
  {
    https: {
      cert: 'path/to/cert.pem',
      key: 'path/to/key.pem',
      ca: 'path/to/ca.pem'
    }
  }
```

#### options.headers (*optional*)

Object representing a set of headers to set in every outgoing response:

``` js
  {
    'x-powered-by': 'your-sweet-application v10.9.8'	
  }
```

### union.BufferedStream(limit)

This constructor inherits from `Stream` and can buffer data up to `limit` bytes. It also implements `pause` and `resume` methods.

### union.HttpStream(options);

This constructor inherits from `union.BufferedStream` and returns a stream with these extra properties:

* *httpStream.url:* The url from the request.
* *httpStream.headers:* The HTTP headers associated with the stream.
* *httpStream.method:* The HTTP method ("GET", "POST", etc).
* *httpStream.query:* The querystring associated with the stream (if applicable).

### union.ResponseStream

This constructor inherits from `union.HttpStream`, and is additionally writeable.

Union supplies this constructor as a basic response stream middleware from which to inherit.

## Tests

All tests are written with [vows][0] and should be run with [npm][1]:

``` bash
  $ npm test
```

#### Author: [Charlie Robbins](http://nodejitsu.com)
#### License: MIT

[0]: http://vowsjs.org
[1]: http://npmjs.org
