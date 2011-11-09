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
  use: [favicon('./favicon.png'))],
  router: router
});

router.get(/foo/, function () {
  this.res.writeHead(200, { 'Content-Type': 'text/plain' })
  this.res.end('hello world\n');
});

router.post(/foo/, { stream: true }, function () {
  var req = this.req,
      res = this.res,
      writeStream;
      
  writeStream = fs.createWriteStream(Date.now() + '-foo.txt'))
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

## Tests
All tests are written with [vows][0] and should be run with [npm][1]:

``` bash
  $ npm test
```

#### Author: [Charlie Robbins](http://nodejitsu.com)
#### License: MIT

[0]: http://vowsjs.org
[1]: http://npmjs.org