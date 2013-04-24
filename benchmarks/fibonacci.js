'use strict';

var fibonacci = function(n) {
  return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
};

var fibonacci_memoized = (function (  ) {
  var memo = [0, 1];
  var fib = function (n) {
    var result = memo[n];
    if (typeof result !== 'number') {
      result = fib(n - 1) + fib(n - 2);
      memo[n] = result;
    }
    return result;
  };
  return fib;
}());

// A test suite
module.exports = {
  name: 'Fibonacci',
  tests: {
    fibonacci: function() {
      fibonacci(4);
    },
    fibonacci_memoized: function() {
      fibonacci_memoized(4);
    }
  }
};
