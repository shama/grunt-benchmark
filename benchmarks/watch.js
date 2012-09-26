'use strict';

var path = require('path');
var grunt = require('grunt');

var watchBase = path.resolve(__dirname, 'watch');
var watchDir = path.resolve(watchBase, 'watch');

var watchTask = require('../lib/grunt-benchmark').spawnTask('watch', {
  // false to trigger on any output
  // We want to benchmark how fast watch triggers a task
  // not the task itself
  trigger: false,
  base: watchBase,
  gruntfile: path.resolve(watchBase, 'Gruntfile.js')
});

// Helper for creating mock files
function createFiles(num, dir) {
  for (var i = 0; i < num; i++) {
    grunt.file.write(path.join(dir, 'test-' + i + '.js'), 'var test = ' + i + ';');
  }
}

module.exports = {
  'setUp': function(done) {
    // ensure that your `ulimit -n` is higher than amount of files
    createFiles(100, path.join(watchDir, 'one'));
    createFiles(100, path.join(watchDir, 'two'));
    createFiles(100, path.join(watchDir, 'three'));
    createFiles(100, path.join(watchDir, 'three', 'four'));
    createFiles(100, path.join(watchDir, 'three', 'four', 'five', 'six'));
    // Counter for where we are in times benchmark is ran
    this.times = 0;
    done();
  },
  'tearDown': function(done) {
    grunt.file.delete(watchDir);
    done();
  },
  'trigger watch task with write': function(done) {
    var that = this;
    watchTask(function() {
      grunt.file.write(path.join(watchDir, 'one', 'test-99.js'), 'var test = "' + that.times + '"');
      grunt.log.write(that.times + ' ');
      that.times++;
    }, done);
  },
  'trigger watch task with delete': function(done) {
    var that = this;
    watchTask(function() {
      grunt.file.delete(path.join(watchDir, 'three', 'four', 'test-' + that.times + '.js'));
      grunt.log.write(that.times + ' ');
      that.times++;
    }, done);
  },
  'trigger watch task with add': function(done) {
    var that = this;
    watchTask(function() {
      grunt.file.write(path.join(watchDir, 'one', 'added-' + that.times + '.js'), 'var test = false;');
      grunt.log.write(that.times + ' ');
      that.times++;
    }, done);
  }
};