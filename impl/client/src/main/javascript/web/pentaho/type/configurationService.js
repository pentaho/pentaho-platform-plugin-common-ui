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
  "pentaho/service!pentaho.type.IConfigurationService?single",
  "./config/ConfigurationService"
], function(LoadedConfigurationService, ConfigurationService) {
  "use strict";

  /**
   * The singleton type configuration service.
   *
   * This singleton exposes an instance of the first class module
   * that is registered as implementing the service {@link pentaho.type.IConfigurationService}
   * (see {@link pentaho.service}).
   *
   * The default system AMD registration registers the class
   * {@link pentaho.type.config.AmdLoadedConfigurationService}.
   *
   * @name pentaho.type.configurationService
   * @type {pentaho.type.IConfigurationService}
   * @amd pentaho/type/configurationService
   *
   * @see pentaho.service
   */
  return LoadedConfigurationService != null ? new LoadedConfigurationService() : new ConfigurationService();
});
