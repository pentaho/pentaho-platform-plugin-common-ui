module.exports = function (config) {
  config.set({
    basePath: '../package-res/resources/web',

    frameworks: ['jasmine', 'requirejs'],

    files: [
      {pattern: 'angular/**/*.js', included: false},
      {pattern: 'bootstrap/**/*.js', included: false},
      {pattern: 'plugin-handler/**/*.js', included: false},
      {pattern: 'angular-directives/**/*.js', included: false},
      {pattern: 'jquery/**/*.js', included: false},
      {pattern: 'ring/**/*.js', included: false},
      {pattern: 'underscore/**/*.js', included: false},
      {pattern: 'test/karma/unit/**/*.js', included: false},
      '../../../config/initEnv.js',
      '../../../build-res/requireCfg-raw.js',
      '../../../config/karma-require-js-cfg.js',
      {pattern: 'angular-directives/**/*.html', included: false}
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
      'plugin-handler/**/*.js': ['coverage'],
      'angular-directives/**/*.js': ['coverage']
    },

    coverageReporter: {
      reporters: [
        {
          type: 'html',
          dir: '../../../bin/reports/jscoverage/html/'
        },
        {
          type : 'cobertura',
          dir : '../../../bin/reports/cobertura/xml/'
        }
      ],
      dir: '../../../bin/reports/'
    },

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_DEBUG

  });
};
