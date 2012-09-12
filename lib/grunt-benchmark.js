/*
 * grunt-benchmark
 * https://github.com/shama/grunt-benchmark
 *
 * Copyright (c) 2012 Kyle Robinson Young
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

  // get grunt command
  var gruntBin = path.resolve(__dirname, '..', 'node_modules', '.bin', 'grunt');
  if (process.platform === 'win32') { gruntBin += '.cmd'; }

  // get next/kill process trigger
  var trigger = options.trigger || 'Waiting...';
  delete options.trigger;

  // turn options into spawn options
  var spawnOptions = [];
  grunt.util._.each(options, function(val, key) {
    spawnOptions.push('--' + key);
    spawnOptions.push(val);
  });
  spawnOptions.push(task);

  // Return an interface for testing this task
  return function(runs, done) {
    var spawnGrunt = spawn(gruntBin, spawnOptions);
    var out = '';

    if (!grunt.util._.isArray(runs)) {
      runs = [runs];
    }

    // After watch starts waiting, run our commands then exit
    spawnGrunt.stdout.on('data', function(data) {
      data = grunt.log.uncolor(String(data));
      out += data;
      // sometimes the data comes in too fast so we use the last line
      var last = grunt.util._.trim(data.split('\n').slice(-1));
      if (last === trigger) {
        if (runs.length < 1) {
          spawnGrunt.kill('SIGINT');
        } else {
          setTimeout(function() {
            var run = runs.shift();
            if (typeof run === 'function') { run(); }
          }, 500);
        }
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