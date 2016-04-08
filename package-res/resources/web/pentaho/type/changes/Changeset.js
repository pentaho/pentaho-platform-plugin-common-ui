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
  "./SimpleChange",
  "../../util/object",
  "../../util/error"
], function(Change, ListChange, SimpleChange, O, error) {
  "use strict";

  /**
   * @name Changeset
   * @memberOf pentaho.type.changes
   * @class
   * @extends pentaho.type.changes.Change
   * @amd pentaho/type/changes/Changeset
   *
   * @classDesc Class that represents a collection of changes in a set of properties
   * in a [complex]{@linkplain pentaho.type.Complex} object.
   *
   * @constructor
   * @description Creates a new instance.
   *
   * @param {!pentaho.type.Complex} owner - The [complex]{@linkplain pentaho.type.Complex} associated with this change.
   */
  return Change.extend("pentaho.type.changes.Changeset", /** @lends pentaho.type.changes.Changeset#*/{

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
     * Determines if this changeset contains the specified property.
     *
     * @param {nonEmptyString|!pentaho.type.Property.Type} name - The property name or type object.
     *
     * @return {boolean} `true` if the property exists and is referenced in this changeset, `false` otherwise.
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

    /**
     * Asserts if this changesets contains any defined changes.
     *
     * @returns {boolean} `true` if at least one property change is defined, `false` otherwise.
     */
    hasChanges: function() {
      return this.propertyNames.length > 0;
    },

    /**
     * Gets the [change]{@link pentaho.type.changes.ValueChange} object associated with the specified property.
     *
     * @param {nonEmptyString|!pentaho.type.Property.Type} name - The property name or type object.
     *
     * @return {?pentaho.type.ValueChange} An object describing the changes to be operated
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
     * @param {(pentaho.type.Value?|pentaho.type.spec.IValue?)} [valueSpec=null] A value specification.
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
          this._properties[pName] = new SimpleChange(this.owner, pName, value1);
        }
      }
    },

    /**
     * Gets the proposed value of a property.
     *
     * @param {nonEmptyString|!pentaho.type.Property.Type} name - The property name or type object.
     *
     * @return {pentaho.type.Value} The value of the property.
     */
    get: function(property) {
      if(!this.has(property)) return null;

      return this.getChange(property).newValue;
    },

    /**
     * Gets the original value of a property.
     *
     * @param {nonEmptyString|!pentaho.type.Property.Type} name - The property name or type object.
     *
     * @return {pentaho.type.Value} The original value of the property (before the change).
     */
    getOld: function(key) {
      if(!this.has(key)) return null;

      return this.getChange(key).oldValue;
    },

    /**
     * Updates the owning [complex]{@linkplain pentaho.type.Complex} with this changes in this changeset.
     */
    commit: function() {
      this._commit();
    },
    //endregion

    //region protected methods
    /**
     * Prevents further changes to this changeset.
     * @protected
     */
    _freeze: function() {
      O.eachOwn(this._properties, function(change) {
        if(change) Object.freeze(change);
      });
      Object.freeze(this._properties);
    },

    /**
     * Updates the owning [complex]{@linkplain pentaho.type.Complex} with this changes in this changeset.
     * @override
     */
    _commit: function() {
      this.propertyNames.forEach(function(property) {
        var change = this.getChange(property);
        change._commit();
      }, this);
    }
    //endregion

  });

});
