module.exports = function(grunt) {
  'use strict';
  grunt.initConfig({
    benchmark: {
      singleTest: {
        src: ['benchmarks/singleTest.js'],
        dest: 'results/singleTest.csv'
      },
      loneFunction: {
        src: ['benchmarks/loneFunction.js'],
        dest: 'results/loneFunction.csv'
      },
      suites: {
        src: ['benchmarks/suites.js'],
        dest: 'results/suites.csv'
      },
      mixedSuite: {
        src: ['benchmarks/mixedSuite.js'],
        dest: 'results/mixedSuite.csv'
      },
      fibonacci: {
        src: ['benchmarks/fibonacci.js'],
        dest: 'results/fibonacci.csv'
      }
    },
    jshint: {
      options: { jshintrc: true },
      all: {
        src: ['Gruntfile.js', 'lib/**/*.js', 'tasks/**/*.js', 'benchmarks/*.js']
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
  grunt.registerTask('default', ['jshint', 'benchmark']);
};
