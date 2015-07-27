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
      {pattern: "build-res/module-scripts/**/{*.js,*.html}",  included: false},
      {pattern: "package-res/resources/web/**/{*.js,*.html}", included: false},
      {pattern: "dev-res/dojo/dojo-release-1.9.2-src/**/{*.js,*.html}", included: false},

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

    // auto run tests when files change
    autoWatch: true,

    browsers:  ["Chrome"],
    reporters: ["progress"],

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO
  });
};
