/*!
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License, version 2.1 as published by the Free Software
 * Foundation.
 *
 * You should have received a copy of the GNU Lesser General Public License along with this
 * program; if not, you can obtain a copy at http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 * or from the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Lesser General Public License for more details.
 *
 * Copyright 2016 Pentaho Corporation. All rights reserved.
 */

"use strict";

/* globals require, define */

/* eslint no-unused-vars: 0 */

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
  basePath = baseUrl + makeRelativeUrl("${build.javascriptTestOutputDirectory}") + "/web";

  function makeRelativeUrl(path) {
    return path
        .replace("${project.basedir}/", "")
        .replace("\\", "/");
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
    "cdf/lib": depDir + "/cdf/js/lib"
  }
};

var KARMA_RUN = true;
var CONTEXT_PATH = "/";
var pen = {define: define, require: require};
var SESSION_LOCALE = "en";
var requireCfg = {
  paths: {},
  shim:  {},
  map:   {"*": {}},
  bundles:  {},
  config:   {
    "pentaho/service": {
    },
    "pentaho/context": {
      locale: SESSION_LOCALE,
      server: {
        url: CONTEXT_PATH
      }
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
 * `test-js/unit/` and before the `.spec.js` extension (e.g. `"pentaho/service"`).
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
