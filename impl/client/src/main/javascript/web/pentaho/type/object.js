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
  "pentaho/module!",
  "./Simple",
  "pentaho/util/object",
  "pentaho/i18n!types"
], function(module, Simple, O, bundle) {

  "use strict";

  var __simpleObjectNextUid = 1;
  var __OID_PROP = "__pentaho_type_ouid_" + Math.random().toString(32) + "__";
  var __DEF_OID_PROP = {
    value: "",
    configurable: true,
    writable:     true,
    enumerable:   false
  };

  /**
   * @name pentaho.type.Object
   * @class
   * @extends pentaho.type.Simple
   * @amd pentaho/type/Object
   *
   * @classDesc The class that represents primitive, JavaScript {@link object} values.
   *
   * @description Creates an object instance.
   */
  return Simple.extend(/** @lends pentaho.type.Object# */{

    constructor: function(spec) {

      this.base(spec);

      // Reuse an existing UID mark, so that two Simple instances with the same underlying primitive value
      // are considered #equal.
      var uid = O.getOwn(this.value, __OID_PROP);
      if(uid == null) {
        // Mark value with a non-enumerable property.
        // Note that non-enumerable properties are not included by JSON.stringify.
        __DEF_OID_PROP.value = uid = String(__simpleObjectNextUid++);
        Object.defineProperty(this.value, __OID_PROP, __DEF_OID_PROP);
      }

      this.__uid = uid;
    },

    /**
     * Gets the unique key of the native object.
     *
     * The key of a value identifies it among its _peers_.
     *
     * @type {string}
     * @readonly
     */
    get $key() {
      return this.__uid;
    },

    /**
     * Gets the underlying object value of the value.
     * @name pentaho.type.Object#value
     * @type object
     * @readonly
     */

    $type: /** @lends pentaho.type.Object.Type# */{
      id: module.id,
      cast: Object
    }
  })
  .localize({$type: bundle.structured.Object})
  .configure({$type: module.config});
});
