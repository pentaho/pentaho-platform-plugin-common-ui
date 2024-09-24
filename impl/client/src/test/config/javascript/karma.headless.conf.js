/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/
const puppeteer = require("puppeteer");
const baseConfig = require("./karma.conf.js");

process.env.CHROME_BIN = puppeteer.executablePath();

module.exports = (config) => {
  baseConfig(config);

  config.set({

    browserNoActivityTimeout: 20000,

    basePath: "${basedir}",

    frameworks: ["jasmine", "requirejs"],

    plugins: [
      "karma-jasmine",
      "karma-requirejs",
      "karma-junit-reporter",
      "karma-coverage",
      "karma-chrome-launcher"
    ],

    reporters: ["progress", "junit", "coverage"],

    preprocessors: {
      // Include only the common-ui's Pentaho source code.
      // All "bundled" external libs should be excluded.
      "${build.outputDirectory}/web/(pentaho|cache|dataapi|dojo/pentaho)/**/*.js": ["coverage"],
      "${build.outputDirectory}/web/(prompting|repo|vizapi)/**/*.js": ["coverage"],
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

    browsers: ["ChromeHeadless"],

    singleRun: true
  });
};
