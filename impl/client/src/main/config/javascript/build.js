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


/* eslint-disable no-unused-expressions, semi */
// noinspection JSRemoveUnnecessaryParentheses
// noinspection BadExpressionStatementJS

({
  // - GENERAL -
  // Sets the logging level. It is a number. If you want "silent" running,
  // set logLevel to 4. From the logger.js file:
  // TRACE: 0,
  // INFO: 1,
  // WARN: 2,
  // ERROR: 3,
  // SILENT: 4
  // Default is 0.
  logLevel: 2,

  // Introduced in 2.1.3: Some situations do not throw and stop the optimizer
  // when an error occurs. However, you may want to have the optimizer stop
  // on certain kinds of errors and you can configure those situations via this option
  throwWhen: {
    // If there is an error calling the minifier for some JavaScript,
    // instead of just skipping that file throw an error.
    optimize: true
  },

  // - INPUT -

  // The top level directory that contains your app. If this option is used
  // then it assumed your scripts are in a subdirectory under this path.
  // If this option is specified, then all the files from the app directory
  // will be copied to the dir: output area, and baseUrl will assume to be
  // a relative path under this directory.
  appDir: "${project.build.outputDirectory}/web",

  // Files which aren't even copied to the output directory.
  fileExclusionRegExp: /^\.|^require\.js$|^common-ui-require-js-cfg\.js$|^require-cfg\.js$|\.md$/,

  // By default, all modules are located relative to this path. If appDir is set, then
  // baseUrl should be specified as relative to the appDir.
  baseUrl: ".",

  mainConfigFile: "${project.build.directory}/requireCfg.js",

  // - OUTPUT -

  // The directory path to save the output. All relative paths are relative to the build file.
  dir: "${project.build.outputDirectory}/web/compressed",

  // As of RequireJS 2.0.2, the dir above will be deleted before the
  // build starts again. If you have a big build and are not doing
  // source transforms with onBuildRead/onBuildWrite, then you can
  // set keepBuildDir to true to keep the previous dir. This allows for
  // faster rebuilds, but it could lead to unexpected errors if the
  // built code is transformed in some way.
  keepBuildDir: false,

  // Automatically generate the RequireJS `bundles` configuration.
  // Requires r.js of version >= 2.2.0
  bundlesConfigOutFile: "${project.build.directory}/requireCfg.bundles.js",

  // Do not write a build.txt file in the output folder.
  // Requires r.js >= 2.2.0.
  writeBuildTxt: false,

  // - TRANSFORMATION -

  // If set to true, any files that were combined into a build bundle will be
  // removed from the output folder.
  removeCombined: true,

  // Disable the included UglifyJS that only understands ES5 or earlier syntax.
  // If the source uses ES2015 or later syntax, pass "optimize: 'none'" to r.js
  // and use an ES2015+ compatible minifier after running r.js.
  optimize: "none",

  optimizeCss: "none",

  onBuildWrite(moduleName, path, contents) {
    // check value to see if code should be minified/uglified
    if ("${js.build.optimizer}" === "none") {
      return contents;
    }

    const { minify } = require.nodeRequire("uglify-js");
    const { code, error } = minify(contents, {
      output: {
        /** @default true */
        beautify: false
      },

      /*
        Overriding these properties to match 'uglify-js2' default values.
        The properties new default values were breaking the code functionality.
      */
      compress: {
        /** @default true */
        collapse_vars: false,

        /** @default false */
        keep_fargs: true,

        /** @default "strict" */
        pure_getters: false,

        /** @default true */
        reduce_vars: false,
      }
    });

    if (error) {
      throw new Error(error);
    }

    return code;
  },

  // Cannot use preserveLicenseComments and generateSourceMaps together...
  // See http://requirejs.org/docs/errors.html#sourcemapcomments.
  // generateSourceMaps: true,

  // Set to false to optimize all files in the output folder,
  // even those not included in a build bundle.
  skipDirOptimize: false,

  paths: {
    // Files that are not to be bundled and
    // that should not have their dependencies traversed.

    // All entry modules of unbundled dependencies.
    "cdf/lib/CCC/def": "empty:",
    "cdf/lib/CCC/pvc": "empty:",
    "cdf/lib/CCC/cdo": "empty:",
    "cdf/lib/CCC/protovis": "empty:",
    "common-ui/echarts": "empty:",

    // These AMD loader plugins are used in lots of code which has nothing to do with
    // the platform bundle code.
    "css": "empty:",
    "text": "empty:",
    "json": "empty:",
    "amd": "empty:"
  },

  modules: [
    {
      name: "pentaho/platformCore",
      excludeShallow: [
        // Don't want to exclude other pentaho/ modules used by these.

        // Exclude these AMD modules as different environments use different impls.
        "pentaho/i18n/defaultService",
        "pentaho/i18n/serverService"
      ]
    },
    {
      name: "pentaho/platformBundle",
      excludeShallow: [
        // Don't want to exclude other pentaho/ modules used by these.

        // Exclude these AMD modules as different environments use different impls.
        "pentaho/i18n/defaultService",
        "pentaho/i18n/serverService"
      ],
      exclude: [
        "pentaho/platformCore",

        // cgg does not like embedded css.
        "css!pentaho/ccc/visual/theme/tipsy.css"
      ]
    }
  ]
})
