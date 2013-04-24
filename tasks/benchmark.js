/*
 * grunt-benchmark
 * https://github.com/shama/grunt-benchmark
 *
 * Copyright (c) 2013 Kyle Robinson Young
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  'use strict';

  var Benchmark = require('Benchmark');
  var path = require('path');
  var fs = require('fs');
  var async = grunt.util.async;
  
  function objectify(obj) {
      // Turn into an object
      if (typeof obj === 'function') {
        obj = { fn: obj };
      }
      return obj;
  }
  
  function logStart(name, src) {
    grunt.log.writeln('\nRunning '+(name ? name+' ' : '')+'[' + src + ']...');
  }
  
  function writeResults(target, dest) {
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
  }

  function runBench(src, dest, options, next) {
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
    else if (typeof benchmarkInfo.name === 'string' && typeof benchmarkInfo.fn === 'function') {
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
          obj = objectify(obj);
          
          // Explicitly give a name or the output of Benchmark.js' filter('winner') command is an empty string
          if (!obj.name) {
            obj.name = '<Test #'+(index+1)+'>';
          }
          
          return obj;
        });
      }
      else {
        // Convert tests to an array of test objects
        tests = grunt.util._.map(tests, function(obj, key) {
          obj = objectify(obj);
          
          // name can be specified as the key or as a property of the test object
          if (!obj.name) {
            obj.name = key;
          }
          
          return obj;
        });
      }
    }
    else {
      grunt.log.error('Invalid configuration: "'+benchmarkOptions.name+'" missing is incorrect');
      return next();
    }
    
    if (singleBenchmark) {
      // Create a single benchmark
      runnable = new Benchmark(benchmarkOptions);
      
      logStart('benchmark '+benchmarkOptions.name, src);
      
      // Add test complete listener
      runnable.on('complete', function() {
        if (!this.error) {
          grunt.log.ok(this);
        }
        writeResults(this, dest);
      });
    }
    else {
      // Create a benchmarking suite
      runnable = new Benchmark.Suite(benchmarkOptions.name, benchmarkOptions);
    
      // TODO: tests as either object or array
      tests.forEach(function(test) { runnable.add(test); });
      
      logStart('suite '+benchmarkInfo.name, src);
      
      // Add test complete listeners
      runnable.on('cycle', function(event) {
        var target = event.target || this;
        
        if (!target.error) {
          grunt.log.ok('   '+target);
        }
        
        writeResults(target, dest);
      });
      
      runnable.on('complete', function() {
        if (!this.error) {
          grunt.log.writeln('Fastest is ' + Benchmark.pluck(Benchmark.filter(this, 'fastest'), 'name'));
        }
      });
    }
    
    // Add listeners
    runnable.on('error', function(event) {
      var target = event.target;
      grunt.log.error('Error running test "'+target.name+'": '+target.error);
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
  }

  grunt.registerMultiTask('benchmark', 'Grunt task for benchmarking grunt tasks', function() {
    // TODO: populate options
    var options = this.options();
    
    var done = this.async();
    async.forEachSeries(this.files, function(fileSet, nextSet) {
      async.forEachSeries(fileSet.src, function(file, next) {
        runBench(file, fileSet.dest || false, options, next);
      }, nextSet);
    }, done);
  });

};
