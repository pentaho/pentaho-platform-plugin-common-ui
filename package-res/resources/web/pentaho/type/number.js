/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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
  "./simple",
  "../i18n!types"
], function(module, simpleFactory, bundle) {

  "use strict";

  return function(context) {

    var Simple = context.get(simpleFactory);

    /**
     * @name pentaho.type.Number
     * @class
     * @extends pentaho.type.Simple
     * @amd {pentaho.type.Factory<pentaho.type.Number>} pentaho/type/number
     *
     * @classDesc The base class of numeric values.
     *
     * @description Creates a number instance.
     */
    return Simple.extend("pentaho.type.Number", {
      /**
       * Gets the underlying number primitive of the value.
       * @name pentaho.type.Number#value
       * @type number
       * @readonly
       */

      type: {
        id: module.id,
        styleClass: "pentaho-type-number",
        cast: toNumber
      }
    }).implement({
      type: bundle.structured["number"]
    });

    function toNumber(v) {
      v = +v;
      return isNaN(v) ? null : v;
    }
  };
});
