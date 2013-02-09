module.exports = function(grunt) {
  'use strict';
  grunt.initConfig({
    benchmark: {
      test: {
        src: ['benchmarks/test.js'],
        dest: 'benchmarks/test.csv',
        options: { times: 10 }
      },
      watch: {
        src: ['benchmarks/watch.js'],
        dest: 'benchmarks/watch.csv',
        options: { times: 10 }
      },
      jshint: {
        src: ['benchmarks/jshint.js'],
        dest: 'benchmarks/jshint.csv',
        options: { times: 10 }
      }
    },
    jshint: {
      options: { jshintrc: '.jshintrc' },
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
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadTasks('tasks');
  grunt.registerTask('default', ['jshint', 'nodeunit']);
};
