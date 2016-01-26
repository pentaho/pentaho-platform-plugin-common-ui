module.exports = function (config) {
  config.set({
    basePath: "../",

    frameworks: ["jasmine", "requirejs"],

    plugins: [
      'karma-jasmine',
      'karma-requirejs',
      'karma-chrome-launcher'
    ],

    files: [
      {pattern: "build-res/module-scripts/**/{*.js,*.html,*.xml}",  included: false},
      {pattern: "package-res/resources/web/**/{*.js,*.html,*.xml,*.properties}", included: false},

      "config/context.js",
      "build-res/requireCfg-raw.js",

      // needs to be last file
      "config/require-config.js"
    ],

    // Too many files cause karma launcher/file-serving errors.
    // Exclude these as we don't use them and they're many.
    exclude: [
      "build-res/module-scripts/common-ui/**",

      // Exclude all unit tests that require dojo
      "package-res/resources/web/test/dojo/**",
      "package-res/resources/web/test/examples/angular-directives/**",
      "package-res/resources/web/test/karma/unit/angular-directives/**",
      "package-res/resources/web/test/prompting/**",
      "package-res/resources/web/test/karma/unit/models-mqlSpec.js",
      "package-res/resources/web/test/dataapi/**",
      "package-res/resources/web/test/karma/unit/urlencoderSpec.js",
      "package-res/resources/web/test/util/TextFormatterSpec.js"
    ],

    // auto run tests when files change
    autoWatch: true,

    browsers:  ["Chrome"],
    reporters: ["progress"],

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO
  });
};
