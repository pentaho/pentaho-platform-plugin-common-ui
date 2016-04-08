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
  "./Change"
], function(Change) {
  "use strict";

  /**
   * @name ValueChange
   * @memberOf pentaho.type.changes
   * @class
   * @extends pentaho.type.changes.Change
   * @amd pentaho/type/changes/ValueChange
   * @abstract
   *
   * @classDesc Class that describes a modification of the [value]{@link pentaho.type.Value} in a property.
   *
   * @constructor
   * @description Creates an instance.
   *
   * @param {!pentaho.type.Complex} owner - The [complex]{@link pentaho.type.Complex} associated with this change.
   */
  return Change.extend("pentaho.type.changes.ValueChange", /** @lends pentaho.type.changes.ValueChange# */{
    constructor: function(owner) {
      this.base(owner);
      this._newValue = undefined;
      this._oldValue = undefined;
    },

    /**
     * The value of the property after the change is made.
     *
     * @type {!pentaho.type.Value}
     */
    set newValue(valueSpec) {
      this.set(valueSpec);
    },

    get newValue() {
      return this._newValue;
    },

    /**
     * The value of the property before the change is made.
     *
     * @type {!pentaho.type.Value}
     * @readonly
     */
    get oldValue() {
      return this._oldValue;
    }

  });

});