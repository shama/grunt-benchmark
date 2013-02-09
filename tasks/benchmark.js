/*
 * grunt-benchmark
 * https://github.com/shama/grunt-benchmark
 *
 * Copyright (c) 2013 Kyle Robinson Young
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  'use strict';

  var ben = require('ben').async;
  var path = require('path');
  var fs = require('fs');
  var async = grunt.util.async;

  function runBench(src, dest, options, done) {
    var benchmarks = require(path.join(process.cwd(), src));

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
      grunt.log.writeln('Benchmarking' + name + ' [' + src + '] x' + options.times + '...');
      var context = {};

      async.series([function(n) {
        setUp.call(context, n);
      }, function(n) {
        ben(options.times, grunt.util._.bind(benchmark.fn, context), function(ms) {
          grunt.log.ok(ms + ' ms per iteration');
          if (dest) {
            if (!grunt.file.exists(dest)) grunt.file.write(dest, 'name,date,times,iteration');
            var today = (new Date()).toString();
            fs.appendFileSync(dest, [name, '"' + today + '"', options.times, ms].join(',') + '\n');
          }
          n();
        });
      }, function(n) {
        tearDown.call(context, n);
      }], nextBenchmark);

    }, done);
  }

  grunt.registerMultiTask('benchmark', 'Grunt task for benchmarking grunt tasks', function() {
    var options = this.options({times: 1});
    var done = this.async();
    async.forEachSeries(this.files, function(fileSet, nextSet) {
      async.forEachSeries(fileSet.src, function(file, next) {
        runBench(file, fileSet.dest || false, options, next);
      }, nextSet);
    }, done);
  });

};
