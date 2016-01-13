module.exports = function (config) {
  config.set({
    basePath: "../",

    frameworks: ["jasmine", "requirejs"],

    plugins: [
      'karma-jasmine',
      'karma-requirejs',
      'karma-junit-reporter',
      'karma-html-reporter',
      'karma-coverage',
      'karma-phantomjs-launcher'
    ],

    files: [
      {pattern: "config/phantomjs-shims.js", included: true},
      {pattern: "build-res/module-scripts/**/*.+(js|html|xml)",  included: false},
      {pattern: "package-res/resources/web/**/*.+(js|html|xml|properties)", included: false},
      {pattern: "dev-res/dojo/dojo-release-1.9.2-src/**/*.+(js|html)", included: false},

      "config/context.js",
      "build-res/requireCfg-raw.js",
      // needs to be last file
      "config/require-config.js"
    ],

    // Too many files cause karma launcher/file-serving errors.
    // Exclude these as we don't use them and they're many.
    exclude: [
      "dev-res/dojo/dojo-release-1.9.2-src/**/tests/**",
      "build-res/module-scripts/common-ui/**"
    ],

    // CI mode
    singleRun: true,

    browsers:  ["PhantomJS"],
    reporters: ["progress", "junit", "coverage"],

    junitReporter: {
      outputFile: "bin/reports/test/js/test-results.xml",
      suite: "unit"
    },

    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      "package-res/resources/web/plugin-handler/**/*.js": ["coverage"],
      "package-res/resources/web/angular-directives/**/*.js": ["coverage"],
      "package-res/resources/web/pentaho/**/*.js": ["coverage"],
      "package-res/resources/web/vizapi/**/*.js": ["coverage"],
      "package-res/resources/web/prompting/**/*.js": ["coverage"],
      "package-res/resources/web/util/**/*.js": ["coverage"],
      "**/*.html": []
    },

    // optionally, configure the reporter
    coverageReporter: {
      reporters: [
        {
          type: "html",
          dir:  "bin/reports/jscoverage/html/"
        },
        {
          type: "cobertura",
          dir:  "bin/reports/cobertura/xml/"
        }
      ],
      dir: "bin/reports/"
    },

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_DEBUG
  });
};
