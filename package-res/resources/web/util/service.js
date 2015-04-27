/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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

/**
 * RequireJS Plugin which maintains a collection of Logical Modules and
 * their dependencies.
 * The dependency list for these logical modules or Dynamic Modules is described in
 * the RequireJS Config object.
 *
 * Scripts require logical modules by name as the argument to this plugin
 * (`"service!LOGICAL_MODULE_NAME"`).
 * An array of the module dependencies is passed to the loading function.
 *
 * Combined, these capabilies form a simple plugin mechanism.
 *
 * @example
 * Load all Home Screen modules
 *
 *     require.config({
 *       config: {
 *         "service": {
 *           "myModule/myHomeScreenModule":    "IHomeScreen",
 *           "anotherModule/homeScreenPlugin": "IHomeScreen"
 *         }
 *       }
 *     });
 *
 *     require(["service!IHomeScreen"], function(arrayOfHomeScreenModules) {
 *
 *     });
 */
define(["module"], function(module) {
  "use strict";

  var A_slice  = Array.prototype.slice,
      O_hasOwn = Object.prototype.hasOwnProperty,

      /**
       * Map from logical module names to an array of physical module dependencies.
       * @type Array.<string[]>
       */
      logicalModules = {};

  processConfig();

  return {
    load: loadLogicalModule
  };

  /**
   * RequireJS Plugin `load` function.
   *
   * @param {String} name The name of the logical module to load.
   * @param {function} require The global require function.
   * @param {function} onLoad Callback function to call once all of the
   *   the logical module's dependencies are satisfied.
   * @param {Object} config The full require-JS config object.
   */
  function loadLogicalModule(name, require, onLoad, config) {
    if(config.isBuild) {
      // Resolved dynamically in the browser.
      onLoad();
    } else {
      // Require all of the logical module's dependencies.
      require(getLogicalModule(name), function() {
        // Pass the resolved modules to the original onLoad function.
        onLoad(A_slice.call(arguments));
      });
    }
  }

  /**
   * Gets a dynamic module definition, creating it if necessary.
   *
   * @param logicalModuleName The name of the logical module.
   * @returns {Array} An array of physical modules that
   *    implement the logical module.
   */
  function getLogicalModule(logicalModuleName) {
    return logicalModules[logicalModuleName] ||
          (logicalModules[logicalModuleName] = []);
  }

  /**
   * Processes the plugin configuration
   * to extract logical module mappings.
   */
  function processConfig() {
    var config = module.config();
    for(var absModuleId in config)
      if(O_hasOwn.call(config, absModuleId))
        getLogicalModule(config[absModuleId]).push(absModuleId);
  }
});
