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
  "./ConfigurationService",
  "pentaho/service!pentaho.type.spec.ITypeConfiguration?meta"
], function(ConfigurationService, configurations) {
  "use strict";

  configurations.sort(function(a, b) {
    return a.moduleId.localeCompare(b.moduleId);
  });

  /**
   * @classDesc The `AmdLoadedConfigurationService` class is an implementation of
   * the {@link pentaho.type.IConfigurationService} interface.
   * This class contains (preloaded) all of the value type configurations that
   * are registered as providing the service {@link pentaho.type.spec.ITypeConfiguration}
   * (see {@link pentaho.service}).
   *
   * The registered AMD modules are first sorted by their module id, and only then added as configurations,
   * so that the rules' specificity documented in {@link pentaho.type.spec.ITypeConfiguration} is respected.
   *
   * @class
   * @alias AmdLoadedConfigurationService
   * @memberOf pentaho.type.config
   * @amd pentaho/type/config/AmdLoadedConfigurationService
   *
   * @extends pentaho.type.config.ConfigurationService
   *
   * @description Creates a configuration service instance that is preloaded with registered
   * value type configuration modules.
   */
  var AmdLoadedConfigurationService = ConfigurationService.extend("pentaho.type.config.AmdLoadedConfigurationService", {
    constructor: function() {
      this.base();

      configurations.forEach(function(configuration) {
        this.add(configuration.value);
      }, this);
    },
  });

  return AmdLoadedConfigurationService;
});
