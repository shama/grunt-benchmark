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
      mixedSuite: {
        src: ['benchmarks/mixedSuite.js'],
        dest: 'results/mixedSuite.csv'
      },
      fibonacci: {
        src: ['benchmarks/fibonacci.js'],
        dest: 'results/fibonacci.csv'
      }//,
      // watch: {
      //   src: ['benchmarks/watch.js'],
      //   dest: 'results/watch.csv',
      //   options: { times: 10 }
      // },
      // jshint: {
      //   src: ['benchmarks/jshint.js'],
      //   dest: 'results/jshint.csv',
      //   options: { times: 10 }
      // }
    },
    jshint: {
      options: { jshintrc: '.jshintrc' },
      all: {
        src: ['Gruntfile.js', 'lib/**/*.js', 'tasks/**/*.js', 'benchmarks/**/*.js']
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
