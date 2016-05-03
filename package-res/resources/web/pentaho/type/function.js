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
  "./simple",
  "../util/fun",
  "../util/logger",
  "../i18n!types"
], function(module, simpleFactory, F, logger, bundle) {

  "use strict";

  var NATIVE_CODE = "[native code]";

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
    return Simple.extend("pentaho.type.Function", {
      /**
       * Gets the underlying function value of the value.
       * @name pentaho.type.Function#value
       * @type function
       * @readonly
       */

      //region serialization
      _toJSONValue: function(keyArgs) {
        var code = String(this._value);
        if(code.indexOf(NATIVE_CODE) > 0) {
          logger.warn(bundle.structured.errors.json.cannotSerializeNativeFunction);

          // Indicate serialization failure.
          code = null;
        }

        return code;
      },
      //endregion

      type: {
        id: module.id,
        styleClass: "pentaho-type-function",
        cast: F.as
      }
    }).implement({
      //jshint -W069
      type: bundle.structured["function"]
    });
  };
});
