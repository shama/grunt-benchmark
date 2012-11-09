module.exports = function(grunt) {
  'use strict';
  grunt.initConfig({
    nothing: {},
    watch: {
      all: {
        files: ['**/*.js'],
        tasks: ['default']
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadTasks('tasks');
  grunt.registerTask('default', ['nothing']);
};
