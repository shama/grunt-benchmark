module.exports = function(grunt) {
  'use strict';
  grunt.initConfig({
    watch: {
      all: {
        files: ['**/*.js'],
        tasks: ['default']
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', function() {});
};
