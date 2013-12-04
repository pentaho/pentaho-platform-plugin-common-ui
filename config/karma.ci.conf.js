module.exports = function (config) {
  config.set({
    basePath: '../package-res/resources/web',

    frameworks: ['jasmine', 'requirejs'],

    files: [
      {pattern: 'angular/**/*.js', included: false},
      {pattern: 'bootstrap/**/*.js', included: false},
      {pattern: 'plugin-handler/**/*.js', included: false},
      {pattern: 'jquery/**/*.js', included: false},
      {pattern: 'ring/**/*.js', included: false},
      {pattern: 'underscore/**/*.js', included: false},
      {pattern: 'test/karma/unit/**/*.js', included: false},
      'test/karma/require-config.js'
    ],

    // auto run tests when files change
    autoWatch: true,

    // CI mode
    singleRun: true,

    browsers: ['PhantomJS'],
    reporters: ['progress', 'junit', 'coverage'],

    junitReporter: {
      outputFile: '../../../bin/reports/test/js/test-results.xml',
      suite: 'unit'
    },

    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'plugin-handler/**/*.js': ['coverage']
    },

    // optionally, configure the reporter
    coverageReporter: {
      type : 'cobertura',
      dir : '../../../bin/reports/cobertura/xml/'
    },

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO

  });
};
