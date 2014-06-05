'use strict';
var fs = require('fs');

module.exports = function( dest,
                           target,
                           grunt ){
  // Create the file withe the column headers
  if( !grunt.file.exists( dest ) ){
    grunt.file.write( dest, 'name,date,error,count,cycles,hz\n' );
  }

  // Append a line with the test results
  var line = [
        '"' + target.name + '"',
        '"' + target.timestamp + '"',
        target.error,
        target.count,
        target.cycles,
        target.hz
      ].join( ',' ) + '\n';

  fs.appendFileSync( dest, line );
};