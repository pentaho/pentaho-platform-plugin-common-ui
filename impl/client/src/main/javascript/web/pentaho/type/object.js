/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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
  "../util/object",
  "../i18n!types"
], function(module, simpleFactory, O, bundle) {

  "use strict";

  var _simpleObjectNextUid = 1;
  var _OID_PROP = "__pentaho_type_ouid_" + Math.random().toString(32) + "__";
  var _DEF_OID_PROP = {
    value: "",
    configurable: true,
    writable:     true,
    enumerable:   false
  };

  return function(context) {

    var Simple = context.get(simpleFactory);

    /**
     * @name pentaho.type.Object
     * @class
     * @extends pentaho.type.Simple
     * @amd {pentaho.type.Factory<pentaho.type.Object>} pentaho/type/object
     *
     * @classDesc A primitive JavaScript object type.
     *
     * @description Creates an object instance.
     */
    var PenObject = Simple.extend(/** @lends pentaho.type.Object# */{

      constructor: function(spec) {

        this.base(spec);

        // Reuse an existing UID mark, so that two Simple instances with the same underlying primitive value
        // are considered #equal.
        var uid = O.getOwn(this._value, _OID_PROP);
        if(uid == null) {
          // Mark value with a non-enumerable property.
          // Note that non-enumerable properties are not included by JSON.stringify.
          _DEF_OID_PROP.value = uid = String(_simpleObjectNextUid++);
          Object.defineProperty(this._value, _OID_PROP, _DEF_OID_PROP);
        }

        this._uid = uid;
      },

      /**
       * Gets the unique key of the native object.
       *
       * The key of a value identifies it among its _peers_.
       *
       * @type {string}
       * @readonly
       */
      get key() {
        return this._uid;
      },

      /**
       * Gets the underlying object value of the value.
       * @name pentaho.type.Object#value
       * @type object
       * @readonly
       */

      type: /** @lends pentaho.type.Object.Type# */{
        id:   module.id,
        alias: "object",
        cast: Object
      }
    }).implement(/** @lends pentaho.type.Object# */{
      type: bundle.structured["object"] // eslint-disable-line dot-notation
    });

    return PenObject;
  };
});
