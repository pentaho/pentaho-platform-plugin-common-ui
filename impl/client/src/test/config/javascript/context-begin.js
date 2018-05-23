/*!
 * Copyright 2010 - 2018 Hitachi Vantara. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";

/* globals require, define */

/* eslint no-unused-vars: 0, no-undef-init: 0 */

var depDir;
var webjarsSubPath = "/META-INF/resources/webjars";
var depWebJars;
var baseTest;
var basePath;

(function() {
  var baseUrl = "/base/";

  depDir = baseUrl + makeRelativeUrl("${build.dependenciesDirectory}");

  depWebJars = depDir + webjarsSubPath;

  baseTest = baseUrl + makeRelativeUrl("${build.javascriptTestSourceDirectory}");
  basePath = baseUrl + makeRelativeUrl("${build.outputDirectory}") + "/web";

  function makeRelativeUrl(path) {
    var basePath = "${project.basedir}/".replace(/\\/g, "/");

    return path
      .replace(/\\/g, "/")
      .replace(basePath, "");
  }
})();

/**
 * The possible configurations to define the environment where the require-cfg files are running.
 * This allows the build and test environments, differing between several plugins to fully configure the path where
 * the files from the external lib are served
 *
 * @type {{paths: {common-ui: string, cdf: string}}}
 */
var ENVIRONMENT_CONFIG = {
  paths: {
    "cdf": depDir + "/cdf/js",
    "cdf/lib": depDir + "/cdf/js/lib",
    "common-ui": basePath
  }
};

/**
 * Indicates that unit tests are being run.
 *
 * Can be used, for example, by RequireJS configuration files to assume different base directories.
 *
 * @type {boolean}
 * @default true
 */
var KARMA_RUN = true;

/**
 * Gets the base Pentaho application path.
 *
 * @type {?string|undefined}
 * @default undefined
 */
var CONTEXT_PATH = undefined;
var pen = {define: define, require: require};
var SESSION_LOCALE = "en";
var requireCfg = {
  paths: {},
  shim:  {},
  map:   {"*": {}},
  bundles:  {},
  config:   {
    "pentaho/modules": {
    },
    "pentaho/environment": {
      locale: SESSION_LOCALE,
      server: {
        root: CONTEXT_PATH,
        services: CONTEXT_PATH + "cxf/"
      }
    },
    "pentaho/debug": {
      // "level": "debug",
      // modules: {
      //   "pentaho/lang/Base": "debug"
      // }
    }
  },
  packages: []
};

/**
 * Whether information about detected specification files
 * is logged to the console.
 *
 * @type boolean
 */
var KARMA_DEBUG = false;

/**
 * A regular expression that limits identified specification files further,
 * for development purposes.
 *
 * The expression is evaluated on the part of the spec file name that is after
 * `test-js/unit/` and before the `.spec.js` extension (e.g. `"pentaho/modules"`).
 *
 * @type RegExp
 *
 * @example
 *
 * // Only prompting spec files
 * var DEV_SPEC_FILTER = /^prompting/;
 *
 * // Only pentaho/type spec files
 * var DEV_SPEC_FILTER = /^pentaho\/type/;
 */
var DEV_SPEC_FILTER = null;
