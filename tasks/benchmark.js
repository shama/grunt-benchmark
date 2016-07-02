/*
 * grunt-benchmark
 * https://github.com/shama/grunt-benchmark
 *
 * Copyright (c) 2016 Kyle Robinson Young
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  'use strict';

  var benchmark = require('./lib/benchmark')(grunt);
  var Table = require('cli-table');

  grunt.registerMultiTask('benchmark', 'Grunt task for benchmarking grunt tasks', function() {
    // TODO: populate options
    var options = this.options();
    grunt.util.async.forEachSeries(this.files, function(fileSet, nextSet) {
      grunt.util.async.forEachSeries(fileSet.src, function(file, next) {
        benchmark.runBench(file, fileSet.dest || false, options, function() {
          // Show results table if requested.
          if (options.displayResults) {
            // Read in the file and parse out headers.
            var rows = grunt.file.read(fileSet.dest).trim().split('\n');
            var headers = rows.shift().split(',');

            // Turn each row of data into separate values.
            rows = rows.map(function(row) {
              return row.split(',');
            });

            // Create a new table.
            var table = new Table({ head: headers });
            table.push.apply(table, rows);

            // Render out the table.
            grunt.log.write('\nResults:\n' + table);
          }

          // Continue.
          next();
        });

      }, nextSet);
    }, this.async());
  });
};
