/*
 * grunt-benchmark
 * https://github.com/shama/grunt-benchmark
 *
 * Copyright (c) 2013 Kyle Robinson Young
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  'use strict';

  var benchmark = require('./lib/benchmark')(grunt);

  grunt.registerMultiTask('benchmark', 'Grunt task for benchmarking grunt tasks', function() {
    // TODO: populate options
    var options = this.options();
    grunt.util.async.forEachSeries(this.files, function(fileSet, nextSet) {
      grunt.util.async.forEachSeries(fileSet.src, function(file, next) {
        benchmark.runBench(file, fileSet.dest || false, options, next);
      }, nextSet);
    }, this.async());
  });
};
