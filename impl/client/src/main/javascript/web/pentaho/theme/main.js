/*!
 * Copyright 2018 - 2019 Hitachi Vantara. All rights reserved.
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
define([
  "require",
  "module",
  "./main",
  "pentaho/module/util",
  "pentaho/shim/es6-promise"
], function(localRequire, module, themeService, configService, moduleUtil) {

  "use strict";

  // "$_$_1", "$_$_2", ...
  var SELF_PREFIX = "$_$_";
  var SELF_REGEX = /^\$_\$_/;
  var selfCounter = 0;

  /**
   * The `pentaho/theme!` module is an AMD/RequireJS loader plugin that
   * loads the configured theme resource modules for a given module.
   *
   * **AMD Plugin Usage**: `"pentaho/theme!{moduleId}"`
   *
   * 1. `{moduleId}` — The identifier of the module being themed. To refer to the requesting module,
   *    use the special value `_`.
   *
   * To register theme resources for a module,
   * configure the module in `pentaho/modules` with a [ThemeAnnotation]{@link pentaho.theme.ThemeAnnotation} annotation.
   *
   * For example, to configure the theme of the `my/View` module to be the `my/theme/view` resource module,
   * specify the following AMD/RequireJS configuration:
   *
   * ```js
   * {
   *   "config": {
   *     "pentaho/modules": {
   *       "my/View": {
   *         "annotations": {
   *           "pentaho/theme/Theme": {"main": "my/theme/view"}
   *         }
   *       }
   *     }
   *   }
   * }
   * ```
   *
   * To load the theme of the current module you request the `pentaho/theme!_` module:
   *
   * ```js
   * // Load the self theme.
   * define(["pentaho/theme!_"], function() {
   *
   * });
   * ```
   *
   * Alternatively, associate the [LoadThemeAnnotation]{@link pentaho.theme.LoadThemeAnnotation}
   * annotation with a module.
   *
   * @name main
   * @memberOf pentaho.theme
   * @type {IAmdLoaderPlugin}
   * @amd pentaho/theme
   *
   * @see pentaho.theme.LoadThemeAnnotation
   * @see pentaho.theme.ThemeAnnotation
   * @see pentaho.theme.spec.IThemeAnnotation
   */

  return {
    load: function(normalizedName, requesterRequire, onLoad, config) {
      if(config.isBuild) {
        // Don't resolve when building.
        onLoad();
      } else {

        var targetModuleId = SELF_REGEX.test(normalizedName)
          ? moduleUtil.getId(requesterRequire)
          : normalizedName;

        return themeService
          .loadModuleThemeAsync(targetModuleId)
          .then(function() { onLoad(); }, onLoad.error);
      }
    },
    normalize: function(name, normalize) {

      // This resolves a name which is relative to the parent module.
      // Still, no way to know the actual requesting module, just the parent module's id (`normalize(".")`).
      if(name && name !== "_") {
        return normalize(name);
      }

      // Unfortunately, RequireJS does not give us access to the requesting module's id at this phase.
      // The load method is only called for each distinct return value of the `normalize` method.
      // Returning an always distinct value ensures it is called once for each use...
      // It's also important to return a value that would never be a real module id.
      return SELF_PREFIX + (++selfCounter);
    }
  };
});
