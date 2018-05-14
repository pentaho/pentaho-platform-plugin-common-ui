var baseConfig = require("./karma.conf.js");

module.exports = function(config) {
  baseConfig(config);

  config.set({

    browserNoActivityTimeout: 20000,

    basePath: "${basedir}",

    frameworks: ["jasmine", "requirejs"],

    plugins: [
      "karma-jasmine",
      "karma-requirejs",
      "karma-junit-reporter",
      "karma-html-reporter",
      "karma-coverage",
      "karma-phantomjs-launcher"
    ],

    reporters: ["progress", "junit", "coverage"],

    preprocessors: {
      // Include only the common-ui's Pentaho source code.
      // All "bundled" external libs should be excluded.
      "${build.outputDirectory}/web/(pentaho|angular-directives|cache|dataapi|dojo/pentaho)/**/*.js": ["coverage"],
      "${build.outputDirectory}/web/(plugin-handler|prompting|repo|vizapi)/**/*.js": ["coverage"],
      "${build.outputDirectory}/web/angular-translate/properties-parser.js": ["coverage"],
      "${build.outputDirectory}/web/util/*.js": ["coverage"]
    },

    junitReporter: {
      useBrowserName: false,
      outputFile: "${build.javascriptReportDirectory}/test-results.xml",
      suite: "unit"
    },

    coverageReporter: {
      useBrowserName: false,
      reporters: [
        {
          type: "html",
          dir: "${build.javascriptReportDirectory}/jscoverage/html/"
        },
        {
          type: "cobertura",
          dir: "${build.javascriptReportDirectory}/cobertura/xml/"
        }
      ],
      dir: "${build.javascriptReportDirectory}"
    },

    logLevel: config.LOG_INFO,

    autoWatch: false,

    browsers: ["PhantomJS"],

    singleRun: true
  });
};
