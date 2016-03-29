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
  "../lang/Base",
  "../util/object",
  "../util/error"
], function(Base, O, error) {
  "use strict";

  /**
   * @classDesc A 'ComplexChangeset' represents a collection of changes in a set of properties.
   *
   * ### `ComplexChangeset` Property Key
   * A `ComplexChangeset` property key is the name of a complex's `property` that had its value changed.
   *
   * ### `ComplexChangeset` Change Object
   * A `ComplexChangeset` `change` object describes the changes to be made to a `property`.
   *
   * @name ComplexChangeset
   * @memberOf pentaho.lang
   *
   * @amd pentaho/lang/ComplexChangeset
   * @class
   * @extends pentaho.lang.Base
   */
  return Base.extend("pentaho.type.ComplexChangeset", /** @lends pentaho.type.ComplexChangeset#*/{

    /**
     * Creates a `ComplexChangeset` with a given owner.
     *
     * @constructor
     *
     * @param {!pentaho.type.Complex} owner - The complex where the change occurred.
     */
    constructor: function(owner) {
      if(!owner) throw error.argRequired("owner");

      this._owner = owner;
      this._properties = {};
    },

    /**
     * Gets the complex where the change occurred.
     *
     * @type !pentaho.type.ComplexChangeset
     * @readonly
     */
    get owner() {
      return this._owner;
    },

    /**
     * Determines if the `ComplexChangeset` contains the specified property.
     *
     * @param {nonEmptyString|!pentaho.type.Property.Type} name - The property name or type object.
     *
     * @return {boolean} `true` if the property exists, `false` otherwise.
     */
    has: function(name) {
      var pType = this.owner.type.get(name);
      if(pType.isList) {
        //does nothing for now
        return false;
      } else {
        return O.hasOwn(this._properties, name);
      }
    },

    /**
     * Sets the value of a property.
     *
     * @param {nonEmptyString|!pentaho.type.Property.Type} name - The property name or type object.
     * @param {any?} [valueSpec=null] A value specification.
     */
    set: function(name, valueSpec) {
      if(!name) throw error.argRequired("property");

      var pType = this.owner.type.get(name);
      if(pType.isList) {
        //TODO: does nothing for now
      } else {
        this._setValueChange(name, pType.toValue(valueSpec));
      }
    },

    /**
     * Gets the change object mapped to the specified property.
     *
     * @param {nonEmptyString|!pentaho.type.Property.Type} name - The property name or type object.
     *
     * @return {?pentaho.lang.ValueChange} An object containing the changes to be operated
     * in the given property, or `null` if the property is not defined in this changeset.
     */
    get: function(name) {
      if(!this.has(name)) return null;
      var propertyName = typeof name === "string" ? name : this.owner.type.get(name).name;
      return this._properties[propertyName];
    },

    /**
     * Gets an array with all of the property names contained in this changeset.
     *
     * @type !string[]
     * @readonly
     */
    get propertyNames() {
      return Object.keys(this._properties);
    },


    /**
     * Sets a new `change` that represents a property which changed value.
     *
     * @param {!string} propertyName - The property name.
     * @param {any?} newValue - The change candidate value.
     * @param {any?} [oldValue] - The original value.
     * @private
     */
    _setValueChange: function(propertyName, newValue, oldValue) {
      var propChange = this._properties[propertyName];
      if(!propChange) {
        propChange = this._properties[propertyName] = {};
        O.setConst(propChange, "type", "set");

        var v0 = arguments.length > 2 ? oldValue : this.owner.get(propertyName);
        O.setConst(propChange, "oldValue", v0);
      }

      propChange.newValue = newValue;
    }
  });

  /**
   * @typedef pentaho.lang.ValueChange
   * @property {!string} [type="set"] - The type of operation.
   * @property {*} oldValue - The previous value of the property.
   * @property {*} newValue - The new value of the property.
   *
   */

});
