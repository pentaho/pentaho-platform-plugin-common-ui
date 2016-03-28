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
  "./Base",
  "../util/object",
  "../util/error"
], function(Base, O, error) {
  "use strict";

  /**
   * @classDesc An `ComplexChangeset` represents a collection of `property` to `change` pairs.
   *
   * ### `ComplexChangeset` Property Key
   * A `ComplexChangeset` property key is the name of a complex's `property` that had its value changed.
   *
   * ### `ComplexChangeset` Change Object
   * A `ComplexChangeset` `change` object is the object representing the change made to a `property`.
   *
   * @name ComplexChangeset
   * @memberOf pentaho.lang
   *
   * @amd pentaho/lang/ComplexChangeset
   * @class
   * @extends pentaho.lang.Base
   */
  return Base.extend("pentaho.lang.ComplexChangeset", /** @lend pentaho.lang.ComplexChangeset#*/{

    /**
     * Creates a `ComplexChangeset` with a given owner.
     *
     * @constructor
     *
     * @param {!pentaho.type.complex} owner - The complex where the change occurred.
     */
    constructor: function(owner) {
      if(!owner) throw error.argRequired("owner");

      this._owner = owner;
      this._properties = {};
    },

    /**
     * Gets the complex where the change occurred.
     *
     * @type !pentaho.lang.ComplexChangeset
     * @readonly
     */
    get owner() {
      return this._owner;
    },

    /**
     * Determines if the `ComplexChangeset` contains the specified property.
     *
     * @param {string} property - The property name.
     *
     * @returns {!boolean} True if the `property` exists, false otherwise.
     */
    has: function(property) {
      return O.hasOwn(this._properties, property);
    },

    /**
     * Sets a new `property` to `change` pair if none exists,
     * otherwise updates it.
     *
     * @param {!string} property - The property name.
     * @param {any?} valueSpec - A object representing a property change.
     */
    set: function(property, valueSpec) {
      if(!property) throw error.argRequired("property");

      var pType = this.owner.type.get(property);
      if(pType.isList) {
        //does nothing for now
      } else {
        this._setValueChange(property, pType.toValue(valueSpec));
      }
    },

    /**
     * Gets the change object mapped to the specified property.
     *
     * @param {string} property - The property name.
     *
     * @returns {?ComplexChangeset|*} The change object,
     * or null when the `ComplexChangeset` does not contain the given `property`.
     */
    get: function(property) {
      if(!this.has(property)) return null;

      return this._properties[property];
    },

    /**
     * Gets an array with all the property names contained in the `ComplexChangeset`.
     *
     * @type !Array
     * @readonly
     */
    get propertyNames() {
      return Object.keys(this._properties);
    },

    /**
     * Executes a provided function once per `ComplexChangeset` property.
     *
     * @param {!function} iterator - Function to execute for each `ComplexChangeset` property, that takes two arguments:
     *  - _change_: The change object of a property
     *  - _propertyName_: The property name
     * @param {any?} [context=this] - The object to use as this when executing the `iterator`.
     */
    each: function(iterator, context) {
      var iteratorContext = context || this;
      this.propertyNames.forEach(function(name) {
        iterator.call(iteratorContext, this.get(name), name);
      }, this);
      //TODO: decide if this should be chainable
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
      var prop = this._properties[propertyName];

      if(!prop) {
        prop = this._properties[propertyName] = {};
        O.setConst(prop, "type", "set");

        var v0 = arguments.length > 2 ? oldValue : this.owner.get(propertyName);
        O.setConst(prop, "oldValue", v0);
      }

      prop.newValue = newValue;
    }
  });

});
