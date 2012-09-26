'use strict';
module.exports = function(grunt) {
  grunt.initConfig({
    benchmark: {
      test: {
        src: ['benchmarks/test.js'],
        options: { times: 10 }
      },
      watch: {
        src: ['benchmarks/watch.js'],
        options: { times: 10 }
      },
      jshint: {
        src: ['benchmarks/jshint.js'],
        options: { times: 10 }
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: {
        src: ['Gruntfile.js', 'bin/*.js', 'lib/*.js', 'tasks/*.js', 'benchmarks/*.js']
      }
    },
    nodeunit: {
      files: ['test/**/*_test.js']
    },
    watch: {
      all: {
        files: ['<%= jshint.all.src %>', '<%= nodeunit.files %>'],
        tasks: ['default']
      }
    }
  });
  grunt.loadTasks('tasks');
  grunt.registerTask('default', ['jshint', 'nodeunit']);
};
