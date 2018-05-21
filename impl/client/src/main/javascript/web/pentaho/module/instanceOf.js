/*!
 * Copyright 2018 Hitachi Vantara. All rights reserved.
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
  "./impl/ServicePlugin"
], function(ServicePlugin) {

  "use strict";

  /**
   * The `pentaho/module/instanceOf!` module is an AMD/RequireJS loader plugin
   * that allows loading a module which provides an instance of a specified type.
   *
   * **AMD Plugin Usage**: `"pentaho/module/instanceOf!{typeId}"`
   *
   * 1. `{typeId}` — The identifier or alias of the type of the desired instance.
   *
   * **Example**
   *
   * The following AMD/RequireJS configuration registers two instances,
   * `mine/homeScreen` and `yours/proHomeScreen`,
   * of the abstract type `IHomeScreen`:
   *
   * ```js
   * require.config({
   *   config: {
   *     "pentaho/modules": {
   *       "IHomeScreen":         {base: null, isAbstract: true},
   *
   *       "mine/homeScreen":     {type: "IHomeScreen"},
   *       "yours/proHomeScreen": {type: "IHomeScreen", ranking: 2}
   *     }
   *   }
   * });
   * ```
   *
   * Later, some other component can request for a registered instance of the type `IHomeScreen`:
   *
   * ```js
   * define(["pentaho/module/instanceOf!IHomeScreen"], function(homeScreen) {
   *
   * });
   * ```
   *
   * The highest ranking instance is chosen.
   *
   * @name instanceOf
   * @memberOf pentaho.module
   * @type {!IAmdLoaderPlugin}
   * @amd pentaho/module/instanceOf
   *
   * @see pentaho.module.service
   * @see pentaho.module.IService#getInstanceOfAsync
   */

  return new ServicePlugin(function(moduleService, moduleId) {
    return moduleService.getInstanceOfAsync(moduleId);
  });
});
