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
define(function() {
  /**
   * The `pentaho/util/requireJSConfig!` module is a RequireJS loader plugin that
   * provides access to the full RequireJS configuration.
   *
   * **AMD Plugin Usage**: `"pentaho/util/requireJSConfig!`
   *
   * @name requireJSConfig
   * @memberOf pentaho.util
   * @type {IAmdLoaderPlugin}
   * @amd pentaho/util/requireJSConfig
   * @private
   */
  return {
    load: function(name, requesterRequire, onLoad, amdConfig) {
      onLoad(amdConfig);
    }
  };
});
