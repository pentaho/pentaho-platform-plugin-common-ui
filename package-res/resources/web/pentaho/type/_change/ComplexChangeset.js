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
  "./Changeset",
  "./ListChangeset",
  "./ValueChange",
  "../../util/object",
  "../../util/error"
], function(Changeset, ListChangeset, ValueChange,
            O, error) {
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
   * @memberOf pentaho.type
   *
   * @amd pentaho/type/ComplexChangeset
   * @class
   * @extends pentaho.lang.Base
   */
  return Changeset.extend("pentaho.type.ComplexChangeset", /** @lends pentaho.type.ComplexChangeset#*/{

    /**
     * Creates a `ComplexChangeset` with a given owner.
     *
     * @constructor
     *
     * @param {!pentaho.type.Complex} owner - The complex where the change occurred.
     */
    constructor: function(complex) {
      if(!owner) throw error.argRequired("owner");
      
      this.base(complex);

      this._properties = {};
    },

    /**
     * Determines if the `ComplexChangeset` contains the specified property.
     *
     * @param {nonEmptyString|!pentaho.type.Property.Type} name - The property name or type object.
     *
     * @return {boolean} `true` if the property exists, `false` otherwise.
     */
    has: function(name) {
      var pName = this.owner.type.get(name).name;
      return pName && O.hasOwn(this._properties, pName);
    },

    hasChanges: function() {
      return this.propertyNames.length > 0;
    },

    /**
     * Sets the value of a property.
     *
     * @param {nonEmptyString|!pentaho.type.Property.Type} name - The property name or type object.
     * @param {any?} [valueSpec=null] A value specification.
     */
    set: function(name, valueSpec) {
      if(!name) throw error.argRequired("name");

      var owner = this.owner;
      var pType = owner.type.get(name);
      var pName = pType.name;
      var value0 = owner._values[pType.name];

      if(pType.isList) {
        this._setListChange(pName, value0, valueSpec);
      } else {
        var value1 = pType.toValue(valueSpec);
        if(!pType.type.areEqual(value0, value1)) {
          this._setValueChange(pName, value1);
        }
      }
    },

    /**
     * Gets the change object mapped to the specified property.
     *
     * @param {nonEmptyString|!pentaho.type.Property.Type} name - The property name or type object.
     *
     * @return {?pentaho.type.ValueChange} An object containing the changes to be operated
     * in the given property, or `null` if the property is not defined in this changeset.
     */
    getChange: function(name) {
      var pName = this.owner.type.get(name).name;
      return pName ? this._properties[pName] || null : null;
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
     * Prevents further changes to this changeset.
     */
    freeze: function(){
      O.eachOwn(this._properties, function(change){
        if(change) Object.freeze(change);
      });
      Object.freeze(this._properties);
    },

    /**
     * Sets a new `change` that represents a property which changed value.
     *
     * @param {!string} propertyName - The property name.
     * @param {any?} newValue - The change candidate value.
     * @private
     */
    _setValueChange: function(propertyName, newValue) {
      this._properties[propertyName] = new ValueChange(propertyName, newValue);
    },

    _setListChange: function(propertyName, oldValue, valueSpec) {
      //set Old Value - making assumption that will create a list change set
      oldValue.set(valueSpec);

      var listChangeset = oldValue.changeset;

      //TODO: 'true' is temporary
      if(true || listChangeset != null)
        this._properties[propertyName] = listChangeset;
    },
    
    //-------------------------------------------

    apply: function() {
      this.propertyNames.forEach(function(property) {
        var change = this.getChange(property);
        if(change != null) //TODO: temporary
          change.apply(this.owner);
        
      }, this);

    },

    get: function(property) {
      if(!this.has(property)) return null;

      return this.getChange(property).newValue();
    },

    //region Old Value
    capture: function(key) {
      if(!this.has(key)) return null;

      return this.getChange(key).capture(key);
    },

    getOld: function(key) {
      if(!this.has(key)) return null;

      return this.getChange(key).oldValue();
    }
    //endregion
    
  });

});
