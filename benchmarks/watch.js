var path = require('path');
var grunt = require('grunt');

var watchBase = path.resolve(__dirname, 'watch');
var watchDir = path.resolve(watchBase, 'watch');

var watchTask = require('../lib/grunt-benchmark').spawnTask('watch', {
  trigger: 'Waiting...',
  base: watchBase,
  gruntfile: path.resolve(watchBase, 'Gruntfile.js')
});

// Helper for creating mock files
function createFiles(num, dir) {
  for (var i = 0; i < num; i++) {
    grunt.file.write(path.join(dir, 'test-' + i + '.js'), 'var test = ' + i + ';');
  }
}

// Counter for where we are in times benchmark is ran
var times = 0;

module.exports = {
  'setUp': function(done) {
    createFiles(100, path.join(watchDir, 'one'));
    createFiles(100, path.join(watchDir, 'two'));
    createFiles(100, path.join(watchDir, 'three'));
    createFiles(100, path.join(watchDir, 'three', 'four'));
    createFiles(100, path.join(watchDir, 'three', 'four', 'five', 'six'));
    done();
  },
  'tearDown': function(done) {
    grunt.file.delete(watchDir);
    done();
  },
  'watch task with a few hundred files': function(done) {
	  watchTask(function() {
	  	grunt.file.write(path.join(watchDir, 'one', 'test-99.js'), 'var test = false;');
      grunt.file.delete(path.join(watchDir, 'three', 'four', 'test-' + times + '.js'));
      times++;
	  }, done);
  }
};