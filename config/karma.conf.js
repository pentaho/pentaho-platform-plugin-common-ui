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


    preprocessors: {
    },

    // auto run tests when files change
    autoWatch: true,

    browsers: ['Chrome'],
    reporters: ['progress'/*, 'coverage'*/],

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO

  });
};
