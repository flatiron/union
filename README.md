# union

A hybrid buffered / streaming middleware kernel backwards compatible with connect.

## Example

``` js
var fs = require('fs'),
    union = require('../lib'),
    sugarskull = require('sugarskull'),
    favicon = require('./middleware/favicon');

var router = new sugarskull.http.Router();

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

server.listen(8080);
console.log('union with sugarskull running on 8080');
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

`options.before` is an array of [connect](https://github.com/senchalabs/connect)-compatible middlewares, which are used to route and serve incoming requests. For instance, in the example, `favicon` is a middleware which handles requests for `/favicon.ico`.

Because union's request handling is connect-compatible, all existing connect middlewares should work out-of-the-box with union.

#### options.after

`options.after` is an array of stream middlewares, which are applied after the request handlers in `options.before`. Stream middlewares inherit from `union.ResponseStream`.

#### options.limit (*optional*)

Union allows you to limit the size of buffered streams. If undefined, there is no limit.

### union.RequestStream

Union supplies this constructor as a basic request stream middleware from which to inherit.

### union.ResponseStream

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
