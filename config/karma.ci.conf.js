module.exports = function (config) {
  config.set({
    basePath: '../',

    frameworks: ['jasmine', 'requirejs'],

    files: [
      {pattern: 'build-res/module-scripts/**/*.js', included: false},
      {pattern: 'build-res/module-scripts/**/*.html', included: false},
      {pattern: 'package-res/resources/web/**/*.js', included: false},
      {pattern: 'package-res/resources/web/**/*.html', included: false},
      {pattern: 'dev-res/dojo/dojo-release-1.9.2-src/**/*.js', included: false},
      {pattern: 'dev-res/dojo/dojo-release-1.9.2-src/**/*.html', included: false},
      'config/context.js',
      'config/initEnv.js',
      'build-res/requireCfg-raw.js',
      'config/require-config.js'
    ],

    // auto run tests when files change
    autoWatch: true,

    // CI mode
    singleRun: true,

    browsers: ['PhantomJS'],
    reporters: ['progress', 'junit', 'coverage'],

    junitReporter: {
      outputFile: 'bin/reports/test/js/test-results.xml',
      suite: 'unit'
    },

    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'package-res/resources/web/plugin-handler/**/*.js': ['coverage'],
      'package-res/resources/web/angular-directives/**/*.js': ['coverage'],
      'package-res/resources/web/vizapi/**/*.js': ['coverage'],
      '**/*.html': []
    },

    // optionally, configure the reporter
    coverageReporter: {
      reporters: [
        {
          type: 'html',
          dir: 'bin/reports/jscoverage/html/'
        },
        {
          type : 'cobertura',
          dir : 'bin/reports/cobertura/xml/'
        }
      ],
      dir: 'bin/reports/'
    },

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_DEBUG

  });
};
