'use strict';

var path = require('path');
var grunt = require('grunt');
var ncp = require('ncp').ncp;
path.sep = path.sep || path.normalize('/');

var watchBase = path.resolve(__dirname, '..', '..', 'benchmarks', 'watch');
var watchDir = path.resolve(watchBase, 'watch');

var benchmark = require('../../lib/grunt-benchmark');

// Build a watch task to test
var watchTask = benchmark.spawnTask('watch', {
  trigger: 'Waiting...',
  cwd: watchBase,
  gruntfile: path.resolve(watchBase, 'Gruntfile.js')
});

// Clean up before and after
function cleanUp() {
  grunt.file.delete(watchDir, {force:true});
  grunt.file.delete(path.join(watchBase, 'node_modules'), {force:true});
}

exports.benchmark = {
  setUp: function(done) {
    cleanUp();
    var src = path.resolve('node_modules/grunt-contrib-watch');
    var dest = path.resolve(watchBase, 'node_modules/grunt-contrib-watch');
    grunt.file.mkdir(watchDir);
    grunt.file.mkdir(dest);
    ncp(src, dest, function(err) {
      if (err) { return grunt.log.error(err); }
      done();
    });
    grunt.file.write(path.join(watchDir, 'test.js'), 'var test = false;');
  },
  tearDown: function(done) {
    cleanUp();
    done();
  },
  in_series: function(test) {
    test.expect(4);
    watchTask([function() {

      test.ok(true, 'First function in series should have ran');
      grunt.file.write(path.join(watchDir, 'test.js'), 'var test = false;');

    }, function() {

      test.ok(true, 'Second function in series should have ran');
      grunt.file.write(path.join(watchDir, 'test.js'), 'var test = false;');

    }], function(result) {

      test.ok((result.indexOf('Waiting...OK') !== -1), 'Should have shown Waiting...OK');
      test.ok((result.indexOf('File "watch' + path.sep + 'test.js" changed.') !== -1), 'Should have shown a file was changed.');

      test.done();

    });
  }
};