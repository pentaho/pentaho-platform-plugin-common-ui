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
  "./Change",
  "./ListChange",
  "./ValueChange",
  "../../util/object",
  "../../util/error"
], function(Change, ListChange, ValueChange, O, error) {
  "use strict";

  /**
   * @classDesc A 'Changeset' represents a collection of changes in a set of properties.
   *
   * ### `Changeset` Property Key
   * A `Changeset` property key is the name of a complex's `property` that had its value changed.
   *
   * ### `Changeset` Change Object
   * A `Changeset` `change` object describes the changes to be made to a `property`.
   *
   * @name Changeset
   * @memberOf pentaho.type
   *
   * @amd pentaho/type/Changeset
   * @class
   * @extends pentaho.lang.Base
   */
  return Change.extend("pentaho.type.changes.Changeset", /** @lends pentaho.type.changes.Changeset#*/{

    /**
     * Creates a `Changeset` with a given owner.
     *
     * @constructor
     *
     * @param {!pentaho.type.Complex} owner - The complex where the change occurred.
     */
    constructor: function(owner) {
      if(!owner) throw error.argRequired("owner");
      this.base(owner);

      this._properties = {};
    },

    //region public interface
    /**
     * @inheritdoc
     */
    get type() {
      return "changeset";
    },

    /**
     * Determines if the `Changeset` contains the specified property.
     *
     * @param {nonEmptyString|!pentaho.type.Property.Type} name - The property name or type object.
     *
     * @return {boolean} `true` if the property exists, `false` otherwise.
     */
    has: function(name) {
      var pName = this.owner.type.get(name).name;
      return pName && O.hasOwn(this._properties, pName);
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

    hasChanges: function() {
      return this.propertyNames.length > 0;
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
        this._properties[pName] = new ListChange(this.owner, value0, valueSpec);
      } else {
        var value1 = pType.toValue(valueSpec);

        if(!pType.type.areEqual(value0, value1)) {
          this._properties[pName] = new ValueChange(this.owner, pName, value1);
        }
      }
    },

    get: function(property) {
      if(!this.has(property)) return null;

      return this.getChange(property).newValue;
    },

    getOld: function(key) {
      if(!this.has(key)) return null;

      return this.getChange(key).oldValue;
    },

    commit: function() {
      this._commit();
    },
    //endregion

    //region protected methods
    /**
     * Prevents further changes to this changeset.
     */
    _freeze: function() {
      O.eachOwn(this._properties, function(change) {
        if(change) Object.freeze(change);
      });
      Object.freeze(this._properties);
    },

    _commit: function() {
      this.propertyNames.forEach(function(property) {
        var change = this.getChange(property);
        change._commit();
      }, this);
    }
    //endregion

  });

});
