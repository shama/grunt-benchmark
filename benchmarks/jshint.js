'use strict';

var path = require('path');
var grunt = require('grunt');

var jshintBase = path.resolve(__dirname, 'jshint');

var jshintTask = require('../lib/grunt-benchmark').spawnTask('jshint', {
  base: jshintBase,
  gruntfile: path.resolve(jshintBase, 'Gruntfile.js')
});

module.exports = {
  'setUp': function(done) {
    grunt.file.write(path.join(jshintBase, 'jshint', 'test.js'), 'var nosemicolon = true');
    done();
  },
  'tearDown': function(done) {
    grunt.file.delete(path.join(jshintBase, 'jshint'));
    done();
  },
  'jshint task': function(done) {
    jshintTask(function() {}, function(result) {
      //console.log(result);
      done();
    });
  }
};