/*
 * grunt-benchmark
 * https://github.com/shama/grunt-benchmark
 *
 * Copyright (c) 2013 Kyle Robinson Young
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  'use strict';
  var exports = {};

  var Benchmark = require('benchmark');
  var path = require('path');
  var fs = require('fs');
  var async = grunt.util.async;

  // Turn function into an object
  exports.objectify = function objectify(obj) {
    return (typeof obj === 'function') ? {fn: obj} : obj;
  };

  exports.logStart = function logStart(name, src) {
    grunt.log.writeln('\nRunning ' + (name ? name + ' ' : '') + '[' + src + ']...');
  };

  exports.writeResults = function writeResults(target, dest) {
    if (dest) {
      // Create the file withe the column headers
      if (!grunt.file.exists(dest)) {
        grunt.file.write(dest, 'name,date,error,count,cycles,hz\n');
      }

      // Append a line with the test results
      var line = [
          '"' + target.name + '"',
          '"' + (new Date()).toString() + '"',
          target.error,
          target.count,
          target.cycles,
          target.hz
      ].join(',') + '\n';

      fs.appendFileSync(dest, line);
    }
  };

  exports.runBench = function runBench(src, dest, options, next) {
    var singleBenchmark = false;
    var benchmarkOptions = {};
    var tests;
    var runnable;
    var benchmarkInfo = require(path.join(process.cwd(), src));

    if (typeof benchmarkInfo === 'function') {
      /*
        // A lone function named by its file
        module.exports = function() {}  // Test function
      */
      benchmarkOptions.name = path.basename(src, '.js');
      benchmarkOptions.fn = benchmarkInfo;
      singleBenchmark = true;
    }
    else {
      // Copy it so we can modify it without breaking future tests
      benchmarkInfo = grunt.util._.extend({}, benchmarkInfo);

      if (typeof benchmarkInfo.name === 'string' && typeof benchmarkInfo.fn === 'function') {
        if (benchmarkInfo.tests) {
          grunt.log.error('Invalid benchmark: "'+benchmarkOptions.name+'" specify either export.fn or export.tests ');
          return next();
        }
        /*
          // A single test
          module.exports = {
            name: String,  // Test name
            fn: Function, // Test function
            [setup: Function],  // Other Benchmark parameters
            [teardown: Function] // etc
        */
        benchmarkOptions = benchmarkInfo;
        singleBenchmark = true;
      }
      else if (benchmarkInfo.tests) {
        /*
          // A suite of tests
          module.exports = {
            name: String, // Suite name
            tests: Object, // Object keyed on test name
            [setup: Function],  // Other Benchmark parameters
            [teardown: Function] // etc
          }
        */

        // Set name
        benchmarkInfo.name = benchmarkInfo.name || path.basename(src, '.js');

        // Extract tests
        tests = benchmarkInfo.tests;
        delete benchmarkInfo.tests;

        // Add in options
        grunt.util._.extend(benchmarkOptions, benchmarkInfo);

        if (Array.isArray(tests)) {
          // Ensure all tests are test objects with valid names
          tests = tests.map(function(obj, index) {
            obj = exports.objectify(obj);

            // Explicitly give a name or the output of Benchmark.js' filter('winner') command is an empty string
            if (!obj.name) {
              obj.name = '<Test #' + (index + 1) + '>';
            }

            return obj;
          });
        }
        else {
          // Convert tests to an array of test objects
          tests = grunt.util._.map(tests, function(obj, key) {
            obj = exports.objectify(obj);

            // name can be specified as the key or as a property of the test object
            if (!obj.name) {
              obj.name = key;
            }

            return obj;
          });
        }
      }
      else {
        grunt.log.error('Invalid configuration: ' + src + ' does not contain a valid test object or test suite', benchmarkInfo);
        return next();
      }
    }

    if (singleBenchmark) {
      // Create a single benchmark
      runnable = new Benchmark(benchmarkOptions);

      exports.logStart('benchmark ' + benchmarkOptions.name, src);

      // Add test complete listener
      runnable.on('complete', function() {
        if (!this.error) {
          grunt.log.ok(this);
        }
        exports.writeResults(this, dest);
      });
    }
    else {
      // Create a benchmarking suite
      runnable = new Benchmark.Suite(benchmarkOptions.name, benchmarkOptions);

      // TODO: tests as either object or array
      tests.forEach(function(test) { runnable.add(test); });

      exports.logStart('suite ' + benchmarkInfo.name, src);

      // Add test complete listeners
      runnable.on('cycle', function(event) {
        var target = event.target || this;

        if (!target.error) {
          grunt.log.ok('   ' + target);
        }

        exports.writeResults(target, dest);
      });

      runnable.on('complete', function() {
        if (!this.error) {
          // Get the tests
          var tests = grunt.util._.sortBy(this, 'hz');

          // Get the top fastest tests
          var fastestTests = Benchmark.filter(this, 'fastest');

          // Only bother if more than one test
          if (tests.length <= 1) {
            return;
          }

          // Get the testest test
          var fastest = fastestTests[0];

          // Extract their names
          var fastestNames = Benchmark.pluck(fastestTests, 'name');

          // Get the second fastest
          var secondFastestTests;
          var secondFastest;
          var secondFastestNames;
          if (fastestTests.length > 1) {
            secondFastestTests = Benchmark.filter(fastestTests.slice(1), 'fastest');
            secondFastest = secondFastestTests[0];
            secondFastestNames = Benchmark.pluck(secondFastestTests, 'name');
          }
          else {
            var slowerTests = grunt.util._.reject(tests, function(obj) {
              return ~fastestNames.indexOf(obj.name);
            });
            secondFastestTests = Benchmark.filter(slowerTests, 'fastest').reverse();
            secondFastest = secondFastestTests[0];
            secondFastestNames = Benchmark.pluck(secondFastestTests, 'name');
          }

          // Calculate how much faster the fastest functions were than the second fastest
          var timesFaster = (fastest.hz/secondFastest.hz);

          var isAre = 'test is';
          if (fastestTests.length > 1) {
            isAre = 'tests are';
          }

          var message = 'Fastest ' + isAre + ' ' + grunt.log.wordlist([fastestNames], { separator: ' and ' });

          // Give increases color based on size of increase
          var increaseColor = false;
          var places = 1;

          if (timesFaster >= 50) {
            increaseColor = 'red';
          }
          else if (timesFaster > 10) {
            increaseColor = 'yellow';
          }
          else if (timesFaster > 1.5) {
            increaseColor = 'green';
          }

          // Add a few more places for small increases
          if (timesFaster < 2) {
            places = 2;
          }

          // Only bother if there wasn't a tie
          if (fastestTests.length !== tests.length) {
            message += ' at ' + grunt.log.wordlist([Benchmark.formatNumber(timesFaster.toFixed(places))+'x'], { color: increaseColor }) + ' faster than ' + grunt.log.wordlist(secondFastestNames, { separator: ' and '});
          }

          grunt.log.writeln(message);
        }
      });
    }

    // Add listeners
    runnable.on('error', function(event) {
      var target = event.target;
      grunt.log.error('Error running test ' + target.name + ': ' + target.error);
    });

    runnable.on('complete', function() {
      // Catch errors
      if (this.error) {
        grunt.log.error(this.error);
      }

      // When done, run the next test
      next();
    });

    // Run the test(s)
    runnable.run();
  };

  return exports;
};