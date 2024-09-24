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
module.exports = function(config) {
  config.set({
    basePath: "${basedir}",

    frameworks: ["jasmine", "requirejs"],

    plugins: [
      "karma-jasmine",
      "karma-requirejs",
      "karma-chrome-launcher",
      "karma-mocha-reporter"
    ],

    files: [
      "${project.build.directory}/context-begin.js",
      "${build.dependenciesDirectory}/*/*-require-js-cfg.js",
      "${project.build.directory}/require.config.js",
      "${build.javascriptTestConfigDirectory}/require-test.js",
      "${project.build.directory}/context-end.js",

      // External dependencies not included in Common-UI (`/target/dependency`).
      {pattern: "${build.dependenciesDirectory}/*/**/*", included: false},

      // Local JS code (`target/classes/web/`).
      {pattern: "${build.outputDirectory}/web/**/*", included: false},

      // Unit tests (`src/test/javascript/`).
      {pattern: "${build.javascriptTestSourceDirectory}/**/*", included: false}
    ],

    reporters: ["mocha"],

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: true,

    browsers: ["Chrome"]
  });
};
