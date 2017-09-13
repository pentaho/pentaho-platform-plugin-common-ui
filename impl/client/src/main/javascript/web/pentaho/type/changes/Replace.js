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
  "./PrimitiveChange",
  "../../util/object"
], function(PrimitiveChange, O) {

  "use strict";

  return PrimitiveChange.extend("pentaho.type.changes.Replace", /** @lends pentaho.type.changes.Replace# */{

    /**
     * @alias Replace
     * @memberOf pentaho.type.changes
     * @class
     * @extends pentaho.type.changes.PrimitiveChange
     *
     * @friend pentaho.type.changes.ComplexChangeset
     *
     * @amd pentaho/type/changes/Replace
     *
     * @classDesc The `Replace` class describes the primitive operation that replaces the value of
     * an [element property]{@link pentaho.type.Property#isList} of a complex instance.
     *
     * This type of change is always part of a {@link pentaho.type.changes.ComplexChangeset}.
     *
     * @constructor
     * @param {!pentaho.type.Property.Type} propType - The property type.
     * @param {pentaho.type.Element} value - The proposed value of the property.
     * @param {number} state - The proposed state of the property.
     *
     * @description Creates an instance.
     */
    constructor: function(propType, value, state) {
      /**
       * Gets the property whose value is replaced.
       *
       * @name property
       * @memberOf pentaho.type.changes.Replace#
       * @type {!pentaho.type.Property.Type}
       * @readOnly
       */
      O.setConst(this, "property", propType);

      this.__value = value;
      this.__state = state;
    },

    /** @inheritDoc */
    _prepareRefs: function(txn, complex, valueIni) {
      this.__replaceRefs(txn, complex, valueIni, this.__value);
    },

    /**
     * Updates the value that will replace the current value.
     *
     * @param {!pentaho.type.changes.Transaction} txn - The ambient transaction, provided for performance.
     * @param {!pentaho.type.Complex} complex - The complex instance.
     * @param {pentaho.type.Element} value - The new proposed value of the property.
     * @param {number} state - The new proposed state of the property.
     * @private
     * @internal
     * @see pentaho.type.changes.ComplexChangeset.__setElement
     */
    __updateValue: function(txn, complex, value, state) {

      this.__replaceRefs(txn, complex, this.__value, value);

      this.__value = value;
      this.__state = state;
    },

    /** @inheritDoc */
    _cancelRefs: function(txn, complex, valueIni) {
      this.__replaceRefs(txn, complex, this.__value, valueIni);
    },

    __replaceRefs: function(txn, complex, v1, v2) {
      if(!this.property.isBoundary) {
        if(v1 && v1.__addReference) txn.__ensureChangeRef(v1).removeReference(complex, this.property);
        if(v2 && v2.__addReference) txn.__ensureChangeRef(v2).addReference(complex, this.property);
      }
    },

    /**
     * Gets the type of change.
     *
     * @type {string}
     * @readOnly
     * @default "replace"
     */
    get type() {
      return "replace";
    },

    /**
     * Gets the value that will replace the current value of the property.
     *
     * @type {pentaho.type.Element}
     * @readOnly
     */
    get value() {
      return this.__value;
    },

    /**
     * Gets the state that will replace the current state of the property.
     *
     * @type {number}
     * @readOnly
     */
    get state() {
      return this.__state;
    },

    /** @inheritDoc */
    _apply: function(target) {
      var name = this.property.name;
      target.__values[name] = this.__value;
      target.__valuesState[name] = this.__state;
    }
  });
});
