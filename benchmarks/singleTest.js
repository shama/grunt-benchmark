'use strict';

module.exports = {
  name: 'Timeout (asynchronous)',
  maxTime: 2,
  defer: true,
  onComplete: function() {
    console.log('Hooray!');
  },
  fn: function(deferred) {
    setTimeout(function() {
      deferred.resolve();
    }, 500);
  }
};
