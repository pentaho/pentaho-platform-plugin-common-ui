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
  "./PrimitiveChange"
], function(PrimitiveChange) {
  "use strict";

  /**
   * @name Replace
   * @memberOf pentaho.type.changes
   * @class
   * @extends pentaho.type.changes.PrimitiveChange
   * @amd pentaho/type/changes/Replace
   * @abstract
   *
   * @classDesc Class that describes the replacement of the value in a [single-valued, simple property]{@linkplain pentaho.type.Simple}.
   *
   * This type of change is always part of a {@link pentaho.type.changes.ComplexChangeset}.
   *
   * @constructor
   * @description Creates an instance.
   */
  return PrimitiveChange.extend("pentaho.type.changes.Replace", /** @lends pentaho.type.changes.Replace# */{

    constructor: function(propertyName, valueSpec) {
      this.propertyName = propertyName;
      this.value = valueSpec;
    },

    /**
     * Gets the type of change.
     *
     * @type {string}
     * @readonly
     * @default "replace"
     */
    get type() {
      return "replace";
    },

    /**
     * Applies the change to a complex value.
     *
     * @param {!pentaho.type.Complex} target - The complex value to apply the change to.
     */
    apply: function(target) {
      var propertyName = this.propertyName;
      target._values[propertyName] = target.type.get(propertyName).toValue(this.value);
    }
  });
});
