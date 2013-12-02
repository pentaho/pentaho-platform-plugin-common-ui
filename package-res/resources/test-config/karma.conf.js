module.exports = function (config) {
  config.set({
    basePath: '../',

    frameworks: ['jasmine', 'requirejs'],

    files: [
//	  {pattern: '*.js', included: false},
	  {pattern: 'web/**/*.js', included: false},
	  {pattern: 'web/**/test/unit/**/*.js', included: false},
      'test-config/require-config.js'
    ],
    
    // auto run tests when files change
    autoWatch: true,

    browsers: ['Chrome'],
    reporters: ['progress'/*, 'coverage'*/],

    // preprocessors: {
    //   // source files, that you wanna generate coverage for
    //   // do not include tests or libraries
    //   // (these files will be instrumented by Istanbul)
    //   'app/js/**/*.js': ['coverage']
    // },

    // optionally, configure the reporter
    // coverageReporter: {
    //   type : 'html',
    //   dir : '../../../bin/reports/coverage/html/'
    // },

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO

  });
};
