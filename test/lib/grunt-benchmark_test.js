'use strict';

var path = require('path');
var grunt = require('grunt');

var watchBase = path.resolve(__dirname, '..', '..', 'benchmarks', 'watch');
var watchDir = path.resolve(watchBase, 'watch');

var benchmark = require('../../lib/grunt-benchmark');

// Build a watch task to test
var watchTask = benchmark.spawnTask('watch', {
  ready: 'Waiting...',
  trigger: false,
  base: watchBase,
  gruntfile: path.resolve(watchBase, 'Gruntfile.js')
});

exports.benchmark = {
  setUp: function(done) {
    done();
  },
  'tearDown': function(done) {
    grunt.file.delete(watchDir);
    done();
  },
  in_series: function(test) {
    test.expect(4);
    watchTask([function() {

      test.ok(true, 'First function in series should have ran');
      grunt.file.write(path.join(watchDir, 'test.js'), 'var test = false;');

    }, function() {

      test.ok(true, 'Second function in series should have ran');
      grunt.file.write(path.join(watchDir, 'test.js'), 'var test = true');

    }], function(result) {

      test.ok((result.indexOf('Waiting...OK') !== -1), 'Should have shown Waiting...OK');
      test.ok((result.indexOf('File "watch/test.js" added.') !== -1), 'Should have shown a file was added.');

      test.done();

    });
  }
};