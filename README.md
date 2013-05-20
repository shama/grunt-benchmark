# grunt-benchmark

Grunt task for benchmarking with [Benchmark.js].

## Getting Started
Install this grunt plugin next to your project's
[Gruntfile][getting_started] with: `npm install grunt-benchmark`

Then add this line to your project's Gruntfile:

```javascript
grunt.loadNpmTasks('grunt-benchmark');
```

[grunt]: https://github.com/cowboy/grunt
[getting_started]: https://github.com/cowboy/grunt/blob/master/docs/getting_started.md

## Documentation

### Basic Usage Example
Create a `benchmarks/` folder and create a benchmark script within that folder,
ie `fibonacci.js`:

```javascript
var fibonacci = function(n) {
  return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
};

module.exports = function() {
  fibbonacci(10);
};
```

The setup your Gruntfile config to run the benchmarks within the `benchmarks/` folder:

```javascript
grunt.initConfig({
  benchmark: {
    all: {
      src: ['benchmarks/*.js'],
      dest: 'benchmarks/results.csv'
    }
  }
});
```

Then run the task:

```
$ grunt benchmark
Running "benchmark:all" (benchmark) task
Benchmarking "0" [benchmarks/test-timeout.js] x10...
>> test-timeout x 418,070 ops/sec ±12.73% (46 runs sampled)
```

Benchmark name, date, times and per iteration will be logged in a csv format.

### Test Options

You can add test options to pass to Benchmark.js by exporting an object of [test options].

```javascript
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
```

**Result:**

```
$ grunt benchmark
Running "benchmark:singleTest" (benchmark) task
Benchmarking "Timeout (asynchronous)" [benchmarks/singleTest.js]...
Hooray!
>> Timeout (asynchronous) x 2.00 ops/sec ±0.14% (8 runs sampled)
```

### Test Suite

You can pit implementations against one another by creating a test suite.

```javascript
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
  name: 'Fibonacci Showdown',
  tests: {
    'Fibonacci': function() {
      fibonacci(10);
      fibonacci(5);
    },
    'Fibonacci2': function() {
      fibonacci_memoized(10);
      fibonacci_memoized(5);
    }
  }
};
```

**Result:**

```
$ grunt benchmark
Running "benchmark:fibonacci" (benchmark) task
Benchmarking suite "Fibonacci" [benchmarks/fibonacci.js]...
>> fibonacci x 13,386,628 ops/sec ±8.63% (74 runs sampled)
>> fibonacci_memoized x 30,509,658 ops/sec ±2.10% (89 runs sampled)
Fastest is fibonacci_memoized
```

#### `exports.tests` as an Object:

Set `exports.tests` to an Object that maps test names to functions and or [Benchmark.js test options].

```javascript
module.exports = {
  name: 'Timeout Showdown',
  tests: {
    'Return immediately (synchronous)': function() {
      return;
    },
    'Timeout: 50ms (asynchronous)': {
      defer: true,
      fn: function(deferred) {
        setTimeout(deferred.resolve, 50);
      }
    },
    'Timeout: 100ms (asynchronous)': {
      defer: true,
      fn: function(done) {
        setTimeout(deferred.resolve, 100);
      }
    }
  }
};
```

#### `exports.tests` as an Array:
Set `exports.tests` to an Array of functions and or [Benchmark.js test options].

```javascript
module.exports = {
  name: 'Timeout Showdown',
  tests: [
    {
      name: 'Return immediately (synchronous)',
      fn: function() {
        return;
      }
    },
    {
      name: 'Timeout: 50ms (asynchronous)',
      defer: true,
      fn: function(done) {
        setTimeout(done, 50);
      }
    },
    {
      name: 'Timeout: 100ms (asynchronous)',
      defer: true,
      fn: function(done) {
        setTimeout(done, 100);
      }
    }
  ]
};
```


### Benchmarking Tasks
Included is a helper, `spawnTask`, for running Grunt tasks within your
benchmarks. This example will create a function to run the `watch` task:

```javascript
// benchmarks/watch.js
// Create a spawnable watch task. Doesnt actually spawn until called.
var watchTask = require('grunt-benchmark').spawnTask('watch', {

  // Text trigger to look for to know when to run the next step or exit
  trigger: 'Waiting...',

  // Base folder and Gruntfile
  // You'll want to setup a fixture base folder and Gruntfile.js
  // to ensure your Grunt'ing appropriately
  base: 'path/to/a/gruntfile-base',
  gruntfile: 'path/to/a/Gruntfile.js'

  // Additional Grunt options can be specified here
});

// Our actual benchmark
module.exports = function(done) {

  // start the watch task
  watchTask([function() {

    // After trigger found, run this sync function
    // this will trigger the watch task
    grunt.file.write('path/to/file.js'), 'var test = false;');

  }, function() {

    // After the previous funciton has ran and another trigger hit...
    // run this next sync function
    grunt.file.delete('path/to/file.js');

  }], function(result) {

    // All done, do something more with the output result or finish up the benchmark
    done();

  });

};
```

### Saving output
Test results will be saved to a CSV file if a destination file is provided.

```javascript
grunt.initConfig({
  benchmark: {
    singleTest: {
      src: ['benchmarks/fibonacci.js'],
      dest: 'results/fibonacci.csv'
    },
  }
});
```

**Results in the following inside of `results/fibonacci.csv`:**

| name               | date                                    | error | count   | cycles  | hz:                 |
| ------------------ | --------------------------------------- | ----- | -------:| -------:| ------------------: |
| fibonacci          | Tue Apr 23 2013 21:25:49 GMT-0700 (PDT) |       | 906237  |      4  | 15154635.038364386  |
| fibonacci_memoized | Tue Apr 23 2013 21:25:54 GMT-0700 (PDT) |       | 1804104 |      4  | 31131880.83560733   |
| fibonacci          | Tue Apr 23 2013 22:10:55 GMT-0700 (PDT) |       | 910791  |      4  | 13386627.749339204  |
| fibonacci_memoized | Tue Apr 23 2013 22:11:01 GMT-0700 (PDT) |       | 1764921 |      4  | 30509657.596336514  |


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style.
Lint and test your code using [grunt][grunt].

## Release History
* 0.2.0 Switched to benchmark.js. Huge thanks to @lazd!
* 0.1.3 Ability to log dest to a csv file. Support Grunt@0.4.0rc7.
* 0.1.2 Update to work with Grunt@0.4.0rc3.
* 0.1.1 Fix require path
* 0.1.0 Initial release

## License
Copyright (c) 2013 Kyle Robinson Young
Licensed under the MIT license.


[Benchmark.js]: http://benchmarkjs.com/
[task options]: http://benchmarkjs.com/docs#options
