'use strict';

module.exports = {
  name: 'Timeout Test',
  fn: function(done) {
    setTimeout(done, 5);
  }
};
