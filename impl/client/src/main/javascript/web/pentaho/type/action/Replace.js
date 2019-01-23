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
  "module",
  "./PrimitiveChange",
  "pentaho/util/object"
], function(module, PrimitiveChange, O) {

  "use strict";

  return PrimitiveChange.extend(module.id, /** @lends pentaho.type.changes.Replace# */{

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
     * @param {pentaho.type.PropertyType} propType - The property type.
     * @param {pentaho.type.Element} valueNew - The proposed value of the property.
     * @param {number} stateNew - The proposed state of the property.
     *
     * @description Creates an instance.
     */
    constructor: function(propType, valueNew, stateNew) {
      /**
       * Gets the property whose value is replaced.
       *
       * @name property
       * @memberOf pentaho.type.changes.Replace#
       * @type {pentaho.type.PropertyType}
       * @readOnly
       */
      O.setConst(this, "property", propType);

      this.__value = valueNew;
      this.__state = stateNew;
    },

    /**
     * Updates the value that will replace the current value.
     *
     * @param {pentaho.type.changes.Changeset} changeset - The changeset.
     * @param {pentaho.type.Element} value - The new proposed value of the property.
     * @param {number} state - The new proposed state of the property.
     * @private
     * @internal
     * @see pentaho.type.changes.ComplexChangeset.__setElement
     */
    __updateValue: function(changeset, value, state) {

      this._setTransactionVersion(changeset.transaction.__takeNextVersion());

      // It may be that only state has changed.
      if(this.__value !== value) {
        this.__replace(changeset, this.__value, value);
      }

      this.__value = value;
      this.__state = state;
    },

    /** @inheritDoc */
    _prepare: function(changeset) {
      var property = this.property;
      if(!property.isBoundary && !property.valueType.isSimple) {
        this.__replace(changeset, changeset.target.__getByName(property.name), this.__value);
      }
    },

    /** @inheritDoc */
    _cancel: function(changeset) {
      var property = this.property;
      if(!property.isBoundary && !property.valueType.isSimple) {
        this.__replace(changeset, this.__value, changeset.target.__getByName(property.name));
      }
    },

    __replace: function(changeset, valueOld, valueNew) {
      if(valueOld && valueOld.__addReference) {
        changeset.__removeComplexElement(valueOld, this.property);
      }

      if(valueNew && valueNew.__addReference) {
        changeset.__addComplexElement(valueNew, this.property);
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
