/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "module",
  "./Service",
  "pentaho/service!pentaho.config.spec.IRuleSet?meta"
], function(module, ConfigurationService, configurations) {
  "use strict";

  configurations.sort(function(a, b) {
    return a.moduleId.localeCompare(b.moduleId);
  });

  /**
   * @classDesc The `AmdLoadedService` class is an implementation of the {@link pentaho.config.IService} interface.
   *
   * This implementation pre-loads all of the registered modules of type {@link pentaho.config.spec.IRuleSet}.
   *
   * The modules are first sorted by their identifier and only then added as configurations,
   * so that the rules' specificity documented in {@link pentaho.config.spec.IRuleSet} is respected.
   *
   * @class
   * @alias AmdLoadedService
   * @memberOf pentaho.config.impl
   * @amd pentaho/config/impl/AmdLoadedService
   * @extends pentaho.config.impl.Service
   * @private
   *
   * @description Creates a configuration service instance that is pre-loaded with registered
   * value type configuration modules.
   */
  var AmdLoadedService = ConfigurationService.extend(module.id, {

    constructor: function() {

      this.base();

      configurations.forEach(function(configuration) {
        this.add(configuration.value);
      }, this);
    }
  });

  return AmdLoadedService;
});
