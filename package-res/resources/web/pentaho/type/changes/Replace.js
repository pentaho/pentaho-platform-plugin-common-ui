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
  "./OwnedChange"
], function(OwnedChange) {
  "use strict";

  /**
   * @name Replace
   * @memberOf pentaho.type.changes
   * @class
   * @extends pentaho.type.changes.OwnedChange
   * @amd pentaho/type/changes/Replace
   * @abstract
   *
   * @classDesc Class that describes the replacement of the value in a [single-valued, simple property]{@linkplain pentaho.type.Simple}.
   *
   * @constructor
   * @description Creates an instance.
   *
   */
  return OwnedChange.extend("pentaho.type.changes.Replace", /** @lends pentaho.type.changes.Replace# */{

    constructor: function(propertyName, valueSpec) {
      this._propertyName = propertyName;
      this._value = valueSpec;
    },

    get type(){
      return "replace";
    },

    /**
     * Modifies the value of a property in a complex.
     *
     * @param {!pentaho.type.Complex} complex - The [complex]{@linkplain pentaho.type.Complex} associated with this change.
     */
    apply: function(complex) {
      var propertyName = this._propertyName;
      complex._values[propertyName] = complex.type.get(propertyName).toValue(this._value);
    }

  });
});
