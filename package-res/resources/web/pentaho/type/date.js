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
  "../i18n!types"
], function(module, simpleFactory, bundle) {

  "use strict";

  return function(context) {

    var Simple = context.get(simpleFactory);

    /**
     * @name pentaho.type.Date
     * @class
     * @extends pentaho.type.Simple
     * @amd {pentaho.type.Factory<pentaho.type.Date>} pentaho/type/date
     *
     * @classDesc The class of a date value.
     *
     * @description Creates a date instance.
     * @constructor
     * @param {pentaho.type.spec.IDate|Date|string} [spec] A date specification.
     */
    return Simple.extend("pentaho.type.Date", {
      /**
       * Gets the underlying `Date` object of the date value.
       * @name pentaho.type.Date#value
       * @type Date
       * @readonly
       */

      //region serialization
      _toJSONValue: function(keyArgs) {
        // A string in a format based upon a simplification of the ISO-8601 Extended Format,
        // as defined by [ECMA-262]{@link http://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.15}.
        return this._value.toJSON();
      },
      //endregion

      type: {
        id: module.id,

        styleClass: "pentaho-type-date",

        cast: function(v) {
          return (v instanceof Date) ? v : new Date(v);
        }
      }
    }).implement({
      //jshint -W069
      type: bundle.structured["date"]
    });
  };
});
