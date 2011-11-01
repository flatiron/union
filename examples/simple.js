var path = require('path'),
    fs = require('fs'),
    http = require('../lib'),
    sugarskull = require('sugarskull'),
    favicon = require('./middleware/favicon');

var router = new sugarskull.http.Router();

var server = http.createServer({
  use: [favicon(path.join(__dirname, 'favicon.png'))],
  router: router
});

router.get(/foo/, function () {
  this.res.writeHead(200, { 'Content-Type': 'text/plain' })
  this.res.end('hello world\n');
});

router.post(/foo/, { stream: true }, function () {
  var self = this,
      writeMe = fs.createWriteStream(path.join(__dirname, Date.now() + '-foo.txt'))
  
  this.req.pipe(writeMe);
  
  writeMe.on('close', function () {
    self.res.writeHead(200, { 'Content-Type': 'text/plain' });
    self.res.end('wrote to a stream!');
  });
});

server.listen(8080);
console.log('flatiron-http running on 8080');