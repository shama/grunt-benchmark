# grunt-benchmark

Grunt task for benchmarking.

*Warning: This is experimental and requires the devel version of Grunt.*

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
Create a `benchmarks` folder and create a benchmark script within that folder,
ie `test-timeout.js`:

```javascript
module.exports = function(done) {
  setTimeout(done, 100);
};
```

The setup your Gruntfile config to run the benchmarks within the `benchmarks`
folder 10 times:

```javascript
grunt.initConfig({
  benchmark: {
    all: {
      src: ['benchmarks/*.js'],
      dest: 'benchmarks/results.csv',
      options: {
        times: 10
      }
    }
  }
});
```

Then run the task:

```
$ grunt benchmark
Running "benchmark:all" (benchmark) task
Benchmarking "0" [benchmarks/test-timeout.js] x10...
>> 101 ms per iteration
```

Benchmark name, date, times and per iteration will be logged in a csv format.

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

### `setUp` and `tearDown`
Setup and teardown convenience functions are available in your benchmarks:

```javascript
module.exports = {
  'setUp': function(done) {
    // set up stuff here
    done();
  },
  'tearDown': function(done) {
    // tear down stuff here
    done();
  },
  'run this benchmark': function(done) {
    // do some processing here
    done();
  }
};
```

**Remember! setUp and tearDown will be called before/after each benchmark test
but NOT each time a benchmark is ran.**

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style.
Lint and test your code using [grunt][grunt].

## Release History
* 0.1.3 Ability to log dest to a csv file. Support Grunt@0.4.0rc7.
* 0.1.2 Update to work with Grunt@0.4.0rc3.
* 0.1.1 Fix require path
* 0.1.0 Initial release

## License
Copyright (c) 2012 Kyle Robinson Young
Licensed under the MIT license.
