/*!
 * Copyright 2010 - 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/module!_",
  "./Simple",
  "pentaho/i18n!types"
], function(module, Simple, bundle) {

  "use strict";

  /**
   * @name pentaho.type.Boolean
   * @class
   * @extends pentaho.type.Simple
   * @amd pentaho/type/Boolean
   *
   * @classDesc The class of boolean values.
   *
   * @description Creates a boolean instance.
   */

  return Simple.extend(/** @lends pentaho.type.Boolean# */{
    /**
     * Gets the underlying boolean primitive value of the value.
     * @name pentaho.type.Boolean#value
     * @type boolean
     * @readonly
     */

    $type: /** @lends pentaho.type.BooleanType# */{
      id: module.id,
      cast: Boolean
    }
  })
  .localize({$type: bundle.structured.Boolean})
  .configure({$type: module.config});
});
