/*
 * simple-test.js: Simple tests for basic streaming and non-streaming HTTP requests with union.
 *
 * (C) 2011, Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    spawn = require('child_process').spawn,
    request = require('request'),
    vows = require('vows');

var examplesDir = path.join(__dirname, '..', 'examples'),
    simpleScript = path.join(examplesDir, 'simple.js'),
    server;

vows.describe('union/simple').addBatch({
  "When using union": {
    "a simple http server": {
      topic: function () {
        server = spawn(process.argv[0], [simpleScript]);
        server.stdout.on('data', this.callback.bind(this, null));
      },
      "a GET request to `/foo`": {
        topic: function () {
          request({ uri: 'http://localhost:8080/foo' }, this.callback);
        },
        "it should respond with `hello world`": function (err, res, body) {
          assert.isTrue(!err);
          assert.equal(res.statusCode, 200);
          assert.equal(body, 'hello world\n');
        }
      }
    }
  }
}).addBatch({
  "When the tests are over": {
    "the server should close": function () {
      server.kill();
    }
  }
}).export(module);

