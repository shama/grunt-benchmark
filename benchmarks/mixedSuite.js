'use strict';

// Mixed suite of functions and object
module.exports = {
  name: 'Timeout Showdown',
  tests: [
    function() {
      return;
    },
    {
      name: 'Timeout: 100ms (asynchronous)',
      defer: true,
      maxTime: 1,
      fn: function(deferred) {
        setTimeout(function() {
          deferred.resolve();
        }, 100);
      }
    },
    {
      name: 'Timeout: 500ms (asynchronous)',
      defer: true,
      maxTime: 1,
      fn: function(deferred) {
        setTimeout(function() {
          deferred.resolve();
        }, 500);
      }
    }
    
  ]
};