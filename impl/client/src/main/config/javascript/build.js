/*!
 * HITACHI VANTARA PROPRIETARY AND CONFIDENTIAL
 *
 * Copyright 2002 - 2018 Hitachi Vantara. All rights reserved.
 *
 * NOTICE: All information including source code contained herein is, and
 * remains the sole property of Hitachi Vantara and its licensors. The intellectual
 * and technical concepts contained herein are proprietary and confidential
 * to, and are trade secrets of Hitachi Vantara and may be covered by U.S. and foreign
 * patents, or patents in process, and are protected by trade secret and
 * copyright laws. The receipt or possession of this source code and/or related
 * information does not convey or imply any rights to reproduce, disclose or
 * distribute its contents, or to manufacture, use, or sell anything that it
 * may describe, in whole or in part. Any reproduction, modification, distribution,
 * or public display of this information without the express written authorization
 * from Hitachi Vantara is strictly prohibited and in violation of applicable laws and
 * international treaties. Access to the source code contained herein is strictly
 * prohibited to anyone except those individuals and entities who have executed
 * confidentiality and non-disclosure agreements or other agreements with Hitachi Vantara,
 * explicitly covering such access.
 */

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

  // How to optimize all the JS files in the build output directory.
  optimize: "${js.build.optimizer}",

  optimizeCss: "none",

  // If using UglifyJS2 for script optimization, these config options can be
  // used to pass configuration values to UglifyJS2.
  // For possible `output`   values see: https://github.com/mishoo/UglifyJS2#beautifier-options
  // For possible `compress` values see: https://github.com/mishoo/UglifyJS2#compressor-options
  uglify2: {
    output: {
      beautify: false
    },
    warnings: false,
    mangle: true,
    compress: true
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

    // These AMD loader plugins are used in lots of code which has nothing to do with
    // the platform bundle code.
    "css": "empty:",
    "text": "empty:",
    "json": "empty:"
  },

  modules: [
    {
      name: "pentaho/platformBundle",
      excludeShallow: [
        // Don't want to exclude other pentaho/ modules used by these.

        // Exclude these AMD modules as different environments use different impls.
        "pentaho/i18n/defaultService",
        "pentaho/i18n/serverService"
      ],
      exclude: [
        // Exclude virtual theme module IDs.
        "pentaho/visual/models/theme/model",
        "pentaho/visual/samples/calc/theme/model"
      ]
    }
  ]
})
