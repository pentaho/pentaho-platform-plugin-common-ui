module.exports = function (config) {
  config.set({
    basePath: '../',

    frameworks: ['jasmine', 'requirejs'],

    files: [
      {pattern: 'app/lib/**/*.js', included: false},
      {pattern: 'app/js/*.js', included: false},
      {pattern: 'app/js/**/*.js', included: false},
      {pattern: 'test/unit/**/*.js', included: false},
      {pattern: 'app/standalone/*.js'},
      '../require-cfg.js'
    ],

    exclude: [
      'app/js/main.js'
    ],

    // auto run tests when files change
    autoWatch: true,

    // CI mode
    singleRun: true,

    browsers: ['PhantomJS'],
    reporters: ['progress', 'junit', 'coverage'],

    junitReporter: {
      outputFile: '../../../../bin/reports/test/js/test-results.xml',
      suite: 'unit'
    },

    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'app/js/**/*.js': ['coverage']
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
