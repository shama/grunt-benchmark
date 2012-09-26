module.exports = function(grunt) {
  'use strict';
  grunt.initConfig({
    jshint: {
      all: {
        src: ['**/*.js']
      },
      options: {
        node: true
      }
    },
    watch: {
      all: {
        files: ['**/*.js'],
        tasks: ['default']
      }
    }
  });
  grunt.registerTask('default', ['jshint']);
};
