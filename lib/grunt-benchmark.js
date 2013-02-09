/*
 * grunt-benchmark
 * https://github.com/shama/grunt-benchmark
 *
 * Copyright (c) 2013 Kyle Robinson Young
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var spawn = require('child_process').spawn;
var grunt = require('grunt');

var benchmark = module.exports = function() {};

// for creating spawnable tasks
benchmark.spawnTask = function spawnTask(task, options) {
  if (!task) {
    throw new Error('Please specify a task');
  }
  options = options || {};

  // CWD to spawn
  var cwd = options.base || options.cwd || process.cwd();
  delete options.cwd;

  // get next/kill process trigger
  var trigger = options.trigger || false;
  delete options.trigger;

  // turn options into spawn options
  var spawnOptions = [process.argv[1]];
  grunt.util._.each(options, function(val, key) {
    spawnOptions.push('--' + key);
    spawnOptions.push(val);
  });
  spawnOptions.push(task);

  // Return an interface for testing this task
  return function(runs, done) {
    var spawnGrunt = spawn(process.argv[0], spawnOptions, {cwd:cwd});
    var out = '';

    if (!grunt.util._.isArray(runs)) {
      runs = [runs];
    }

    // Append a last function to kill spawnGrunt
    runs.push(function() { spawnGrunt.kill('SIGINT'); });

    // After watch starts waiting, run our commands then exit
    spawnGrunt.stdout.on('data', function(data) {
      data = grunt.log.uncolor(String(data));
      out += data;

      // If we should run the next function
      var shouldRun = true;

      // If our trigger has been found
      if (trigger !== false) {
        shouldRun = (grunt.util._.indexOf(data.split("\n"), trigger) !== -1);
      }

      // Run the function
      if (shouldRun) {
        setTimeout(function() {
          var run = runs.shift();
          if (typeof run === 'function') { run(); }
        }, 500);
      }
    });

    // Throw errors for better testing
    spawnGrunt.stderr.on('data', function(data) {
      throw new Error(data);
    });

    // On process exit return what has been outputted
    spawnGrunt.on('exit', function() {
      done(out);
    });
  };
};
