module.exports = function(config) {
  config.set({

    plugins: [
      'karma-jasmine',
      'phantomjs',
      'karma-phantomjs-launcher',
      'karma-coverage',
      'morgan'
    ],

    basePath: '',

    frameworks: ['jasmine'],

    files: [
      'node_modules/lodash/lodash.js',
      'node_modules/crossroads/node_modules/signals/dist/signals.js',
      'node_modules/crossroads/dist/crossroads.js',
      'node_modules/hasher/dist/js/hasher.js',
      'src/*.js'
    ],

    exclude: [
    ],

    preprocessors: {
      'src/**/*.js': ['coverage']
    },

    reporters: ['progress', 'coverage'],

    coverageReporter: {
      type : 'lcov',
      dir : 'coverage/'
    },

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: true,

    browsers: ['PhantomJS'],

    singleRun: false
  });
};