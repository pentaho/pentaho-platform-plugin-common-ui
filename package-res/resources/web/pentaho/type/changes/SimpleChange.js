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
  "./ValueChange",
  "../../util/error"
], function(ValueChange, error) {
  "use strict";

  /**
   * @name SimpleChange
   * @memberOf pentaho.type.changes
   * @class
   * @extends pentaho.type.changes.ValueChange
   * @amd pentaho/type/changes/SimpleChange
   * @abstract
   *
   * @classDesc Class that describes the replacement of the value in a [single-valued, simple property]{@linkplain pentaho.type.Simple}.
   *
   * @constructor
   * @description Creates an instance.
   *
   * @param {!pentaho.type.Complex} owner - The [complex]{@linkplain pentaho.type.Complex} associated with this change.
   */
  return ValueChange.extend("pentaho.type.changes.SimpleChange", /** @lends pentaho.type.changes.SimpleChange# */{

    constructor: function(owner, propertyName, valueSpec) {
      if(!owner) throw error.argRequired("owner");
      this.base(owner);
      this._propertyName = propertyName;
      this._oldValue = owner.get(propertyName);
      this._pType = owner.type.get(propertyName);

      if(valueSpec !== undefined) this.set(valueSpec);
    },

    /**
     * @inheritdoc
     */
    get type() {
      return "set";
    },

    /**
     * @name newValue
     * @type {!pentaho.type.Simple}
     * @override
     */

    /**
     * @name oldValue
     * @type {!pentaho.type.Simple}
     * @override
     */

    /**
     * @override
     * @param {!pentaho.type.Simple|!pentaho.type.spec.ISimple} valueSpec - The value of the property, or its specification.
     */
    set: function(valueSpec) {
      this._newValue = this._pType.toValue(valueSpec);
    },

    /**
     * Returns the modified value of the property.
     *
     * @return {!pentaho.type.Value} Returns the modified value of the property.
     */
    apply: function(/* propertyValue */) {
      return this.newValue;
    },

    /**
     * @inheritdoc
     */
    _commit: function() {
      this.owner._values[this._propertyName] = this.newValue;
    }

  });
});
