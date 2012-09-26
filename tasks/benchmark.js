/*
 * grunt-benchmark
 * https://github.com/shama/grunt-benchmark
 *
 * Copyright (c) 2012 Kyle Robinson Young
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
	'use strict';

	var ben = require('ben').async;
  var path = require('path');
  var async = grunt.util.async;

  grunt.registerMultiTask('benchmark', 'Grunt task for benchmarking grunt tasks', function() {
    var files = grunt.file.expandFiles(grunt.util._.pluck(this.files, 'src'));
    var options = this.options();
    var times = options.times || 1;
    var done = this.async();

    grunt.file.clearRequireCache(files);
    
    async.forEachSeries(files, function(file, nextFile) {
      var benchmarks = require(path.join(process.cwd(), file));

      // if only a single benchmark
      if (typeof benchmarks === 'function') {
        benchmarks = {0:benchmarks};
      }

      // get setUp and tearDown
      var setUp = benchmarks.setUp || function(fn) { fn(); };
      var tearDown = benchmarks.tearDown || function(fn) { fn(); };
      delete benchmarks.setUp;
      delete benchmarks.tearDown;

      // Convert benchmarks to an array
      benchmarks = grunt.util._.map(benchmarks, function(fn, name) {
        return {name: name, fn: fn};
      });

      // run benchmarks
      async.forEachSeries(benchmarks, function(benchmark, nextBenchmark) {
        var name = (benchmark.name !== '0') ? ' "' + benchmark.name + '"' : '';
        grunt.log.writeln('Benchmarking' + name + ' [' + file + '] x' + times + '...');
        var context = {};

        async.series([function(n) {
          setUp.call(context, n);
        }, function(n) {
          ben(times, grunt.util._.bind(benchmark.fn, context), function(ms) {
            grunt.log.ok(ms + ' ms per iteration');
            n();
          });
        }, function(n) {
          tearDown.call(context, n);
        }], nextBenchmark);

      }, nextFile);

    }, done);

  });

};
