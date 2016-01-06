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
 * AMD plugin which maintains a collection of _logical modules_ and their _dependencies_.
 * 
 * #### AMD
 * 
 * **Module Id**: `"service"`
 * 
 * **Plugin Usage**: `"service!{logical-module-name}"`
 * 
 *   * `{logical-module-name}` — the name of a required logical module.
 * 
 * #### A Plugin mechanism
 * 
 * The dependency list of logical modules is described in the 
 * AMD configuration object, under this module's configuration section.
 * 
 * Scripts require logical modules by _name_ as the argument to this plugin.
 * An array with its dependencies is passed to the loading function.
 *
 * Combined, these capabilities form a simple plugin mechanism.
 *
 * #### Module as a Service
 * 
 * A logical module can be taken 
 * to represent a _service_, having a certain predefined contract or interface type, and, 
 * its dependencies, 
 * to be the AMD modules that _implement_ it (or _provide_ it).
 *  
 * #### Logical module value type
 * 
 * There are no a priori constraints on the type of value of dependency modules 
 * of a logical module — or, more loosely, on the type of value(s) of a logical module.
 * 
 * When a logical module has a certain value type,
 * that should be described in its documentation.
 * More often than not, the value type can be precisely defined as an interface or class.
 * 
 * Currently, the plugin mechanism makes no assurances on the type of value of 
 * a logical module's dependencies. 
 * However, scripts requiring a logical module _should_ trust that 
 * the provided dependencies respect any documented contract.
 * 
 * #### Configuration
 * 
 * A module can be the dependency of a single logical module
 * (a module can only provide a single service).
 * 
 * See the configuration syntax in the accompanying examples.
 * 
 * @example
 * Load all dependencies of the "IHomeScreen" logical module:
 *
 *     // Register the dependencies of a logical module
 *     require.config({
 *       config: {
 *         "pentaho/service": {
 *           "toyModule/myHomeScreen":   "IHomeScreen",
 *           "megaPlugin/proHomeScreen": "IHomeScreen"
 *         }
 *       }
 *     });
 *
 *     // Require the dependencies of a logical module
 *     require(["service!IHomeScreen"], function(arrayOfHomeScreenModules) {
 * 
 *  	     arrayOfHomeScreenModules.forEach(function(homeScreen) {
 *            // consume `homeScreen`
 *         });
 * 
 *     });
 * 
 * @example
 * In an AMD configuration file (one whose named ends in `"require-js-cfg.js"`), 
 * the dependencies of a logical module can be specified like:
 *
 *     requireCfg.config.service["toyModule/myHomeScreen"  ] = "IHomeScreen";
 *     requireCfg.config.service["megaPlugin/proHomeScreen"] = "IHomeScreen";
 */
define([
  "module",
  "pentaho/util/object"
], function(module, O) {
  "use strict";

  var A_slice  = Array.prototype.slice,
      /**
       * A map from logical module names to ids of dependency modules.
       * @type Object.<string, string[]>
       */
      logicalModules = {};

  processConfig();

  return {
    load: loadLogicalModule
  };

  /**
   * The `load` function of the AMD plugin.
   * 
   * An empty logical module name is resolved as an empty array.
   * An unregistered logical module name is resolved as an empty array.
   * 
   * @param {String} name The name of the logical module to load.
   * @param {function} require The global require function.
   * @param {function} onLoad Callback function to call once all of the
   *   the logical module's dependencies are satisfied.
   *   Receives, as single argument, an array with the 
   *   logical module's dependencies.
   * @param {Object} config The full require-JS config object.
   */
  function loadLogicalModule(name, require, onLoad, config) {
    if(config.isBuild) {
      // Don't include dependencies in the build.
      // These are resolved dynamically in the "browser".
      // If a specific dependency should be included in the build,
      // it must be included explicitly and directly,
      // by specifying its AMD module id.
      onLoad();
    } else {
      // `require` is ok with resolving empty arrays as empty arrays.
      // Create any requested logical module, even if it has no registrations.
      // Empty name included, just to make the code simpler
      // (there's no way to register a dependency under an empty logical name).
      require(getLogicalModule(name), function() {
        // Pass the resolved modules to the original onLoad function,
        // as a single array argument.
        onLoad(A_slice.call(arguments));
      });
    }
  }

  /**
   * Gets the ids of modules registered as dependencies of a given logical module.
   * 
   * @param {string} logicalModuleName The name of the logical module.
   * @returns {Array} An array of module ids, possibly empty.
   */
  function getLogicalModule(logicalModuleName) {
    return O.getOwn(logicalModules, logicalModuleName) ||
           (logicalModules[logicalModuleName] = []);
  }

  /**
   * Processes this module's AMD configuration, 
   * which includes the registration of dependencies of logical modules.
   * 
   * Ignores a _nully_ module configuration value.
   * Ignores _falsy_ physical and logical module ids.
   */
  function processConfig() {
    var config = module.config(), logicalModule;
    for(var absModuleId in config) // nully tolerant
      if(absModuleId && (logicalModule = O.getOwn(config, absModuleId)))
        getLogicalModule(logicalModule).push(absModuleId);
  }
});
