'use strict';

module.exports = function( dest,
                           target,
                           grunt ){
  var data;
  if( grunt.file.exists( dest ) ){
    data = grunt.file.readJSON( dest );
    data.push( target );
  }else{
    data = [target];
  }
  grunt.file.write( dest, JSON.stringify( data, null, "  " ) );
};