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
  "../util/fun",
  "../util/logger",
  "../i18n!types"
], function(module, simpleFactory, O, F, logger, bundle) {

  "use strict";

  var NATIVE_CODE = "[native code]";

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
     * @name pentaho.type.Function
     * @class
     * @extends pentaho.type.Simple
     * @amd {pentaho.type.Factory<pentaho.type.Function>} pentaho/type/function
     *
     * @classDesc A primitive JavaScript function type.
     *
     * @description Creates a function instance.
     * @constructor
     * @param {pentaho.type.spec.IFunction|function|string} [spec] A function specification.
     */
    var PenFunction = Simple.extend(/** @lends pentaho.type.Function# */{
      /**
       * Gets the underlying function value of the value.
       * @name pentaho.type.Function#value
       * @type function
       * @readonly
       */

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
       * Gets the unique key of the native function.
       *
       * The key of a value identifies it among its _peers_.
       *
       * @type {string}
       * @readonly
       */
      get key() {
        return this._uid;
      },

      // region serialization
      /** @inheritDoc */
      _toJSONValue: function(keyArgs) {
        var code = String(this._value);
        if(code.indexOf(NATIVE_CODE) > 0) {
          logger.warn(bundle.structured.errors.json.cannotSerializeNativeFunction);

          // Indicate serialization failure.
          code = null;
        }

        return code;
      },
      // endregion

      type: /** @lends pentaho.type.Function.Type# */{
        id: module.id,
        alias: "function",
        cast: F.as
      }
    }).implement(/** @lends pentaho.type.Function# */{
      type: bundle.structured["function"] // eslint-disable-line dot-notation
    });

    return PenFunction;
  };
});
