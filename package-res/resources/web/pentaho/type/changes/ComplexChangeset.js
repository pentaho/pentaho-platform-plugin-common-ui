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
  "./Replace",
  "../../util/object",
  "../../util/error"
], function(Changeset, ListChangeset, Replace, O, error) {

  "use strict";

  /**
   * @name ComplexChangeset
   * @memberOf pentaho.type.changes
   * @class
   * @extends pentaho.type.changes.Changeset
   * @amd pentaho/type/changes/ComplexChangeset
   *
   * @classDesc The class `ComplexChangeset` describes a set of changes to the values of properties
   * in a [complex]{@linkplain pentaho.type.Complex} value.
   *
   * @constructor
   * @description Creates a new instance.
   *
   * @param {!pentaho.type.Complex} owner - The complex value where the changes take place.
   */
  return Changeset.extend("pentaho.type.changes.ComplexChangeset", /** @lends pentaho.type.changes.ComplexChangeset#*/{

    constructor: function(owner) {
      this.base(owner);

      this._changes = {};
    },

    /**
     * Gets the complex value where the changes take place.
     *
     * @name pentaho.type.changes.ComplexChangeset#owner
     * @type {!pentaho.type.Complex}
     * @readonly
     */

    //region public interface
    /**
     * Gets the type of change.
     *
     * @type {string}
     * @readonly
     * @default "complex"
     */
    get type() {
      return "complex";
    },

    /**
     * Gets a value that indicates if this changeset contains any changes.
     *
     * @type {boolean}
     */
    get hasChanges() {
      var hasChanges = false;

      O.eachOwn(this._changes, function(change) {
        if(!(change instanceof Changeset) || change.hasChanges) {
          hasChanges = true;
          return false;
        }
      });

      return hasChanges;
    },

    /**
     * Removes all changes from this changeset.
     *
     * @private
     */
    _clearChanges: function() {

      this._assertProposed();

      O.eachOwn(this._changes, function(change) {
        if(change instanceof Changeset) change.cancel();
      });

      this._changes = {};
    },

    /**
     * Gets the [change]{@link pentaho.type.changes.ValueChange} object associated with the specified property.
     *
     * @param {nonEmptyString|!pentaho.type.Property.Type} name - The property name or type object.
     *
     * @return {?pentaho.type.ValueChange} An object describing the changes to be performed
     * in the given property, or `null` if the property has not changed.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `name` is not defined.
     */
    getChange: function(name) {
      var pName = this.owner.type.get(name).name;
      return O.getOwn(this._changes, pName, null);
    },

    /**
     * Determines if the given property has changed.
     *
     * @param {nonEmptyString|!pentaho.type.Property.Type} name - The property name or type object.
     *
     * @return {boolean} `true` if the property has changed, `false` otherwise.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `name` is not defined.
     */
    hasChange: function(name) {
      var pName = this.owner.type.get(name).name;
      return O.hasOwn(this._changes, pName);
    },

    /**
     * Gets an array with all of the property names contained in this changeset.
     *
     * @type {!string[]}
     * @readonly
     */
    get propertyNames() {
      return Object.keys(this._changes);
    },

    /**
     * Sets the proposed value of a property.
     *
     * @param {nonEmptyString|!pentaho.type.Property.Type} name - The property name or type object.
     * @param {(pentaho.type.Value|pentaho.type.spec.IValue)} valueSpec - A value or value specification.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `name` is not defined.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the changeset has already been applied or canceled.
     *
     * @private
     * @friend pentaho.type.Complex
     */
    _set: function(name, valueSpec) {
      if(!name) throw error.argRequired("name");

      this._assertProposed();

      var owner = this.owner;
      var pType = owner.type.get(name);
      var pName = pType.name;
      var value0 = owner._values[pType.name];

      if(pType.isList) {
        // Enlists back a list changeset!
        value0.set(valueSpec);
      } else {
        var value1 = pType.toValue(valueSpec);

        if(!pType.type.areEqual(value0, value1)) {
          this._changeSimpleValue(pName, value1);
        }
      }
    },

    /**
     * Registers a change to the value of a single-valued property.
     *
     * @param {string} pName - The name of the property.
     * @param {pentaho.type.Simple} newValue - The proposed value of the property.
     *
     * @private
     */
    _changeSimpleValue: function(pName, newValue) {
      var simpleChange = this._changes[pName];
      if(simpleChange)
        simpleChange.value = newValue;
      else
        this._changes[pName] = new Replace(pName, newValue);
    },

    /**
     * Gets the proposed value of a property.
     *
     * @param {nonEmptyString|!pentaho.type.Property.Type} name - The property name or type object.
     *
     * @return {pentaho.type.Value} The value of the property, possibly `null`.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `name` is not defined.
     */
    get: function(name) {
      var change = this.getChange(name);
      if(!change) return this.owner.get(name); //returns the current value when there are no changes

      return change.type === "replace" ? change.value : change.newValue;
    },

    /**
     * Gets the original value of a property.
     *
     * @param {nonEmptyString|!pentaho.type.Property.Type} name - The property name or type object.
     *
     * @return {pentaho.type.Value} The original value of the property (before the change).
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `name` is not defined.
     */
    getOld: function(name) {
      var change = this.getChange(name);
      if(!change) return this.owner.get(name); // returns the current value when not changed

      return change instanceof Changeset ? change.owner : this.owner.get(name);
    },

    _apply: function(target) {

      var isAlternateTarget = target !== this.owner;

      this.propertyNames.forEach(function(property) {
        var change = this[property];
        if(change instanceof Changeset) {
          // Get the corresponding changeset owner in the alternate target.
          if(isAlternateTarget)
            /* istanbul ignore next : does not happen atm as only lists are simulated/projected */
            change._apply(target._values[property]);
          else
            change.apply();

        } else {
          change._apply(target);
        }
      }, this._changes);
    },

    _cancel: function() {
      this.propertyNames.forEach(function(property) {
        var change = this[property];
        if(change instanceof Changeset) change.cancel();
      }, this._changes);
    }
    //endregion
  });
});