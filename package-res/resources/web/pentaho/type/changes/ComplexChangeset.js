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
   * @classDesc Describes a set of changes in a collection of properties
   * in a [complex]{@linkplain pentaho.type.Complex} object.
   *
   * @constructor
   * @description Creates a new instance.
   *
   * @param {!pentaho.type.Complex} owner - The [complex object]{@linkplain pentaho.type.Complex} associated with this changeset.
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
      // Avoid creating an array to know if there are any properties.
      // Could also add this as an utility method to O.hasAnyOwn(o).
      for(var p in this._changes)
        if(O.hasOwn(this._changes, p))
          return true;

      return false;
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

    // TODO: Doesn't this method break the symmetry with Complex#has ?
    // Shouldn't it be called `hasChange(name)` ?

    /**
     * Determines if the given property has changed.
     *
     * @param {nonEmptyString|!pentaho.type.Property.Type} name - The property name or type object.
     *
     * @return {boolean} `true` if the property has changed, `false` otherwise.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `name` is not defined.
     */
    has: function(name) {
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
     * @param {(pentaho.type.Value|pentaho.type.spec.IValue)} valueSpec A value or value specification.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `name` is not defined.
     */
    set: function(name, valueSpec) {
      if(!name) throw error.argRequired("name");

      var owner = this.owner;
      var pType = owner.type.get(name);
      var pName = pType.name;
      var value0 = owner._values[pType.name];

      if(pType.isList) {
        this._changes[pName] = new ListChangeset(value0, valueSpec);
      } else {
        var value1 = pType.toValue(valueSpec);

        if(!pType.type.areEqual(value0, value1)) {
          this._changes[pName] = new Replace(pName, value1);
        }
      }
    },

    // TODO: Doesn't this method break the symmetry with Complex#get ?
    // Should it not return the current value when there are no changes ?

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
      if(!change) return null;

      return change.type === "replace" ? change._value : change.newValue;
    },

    // TODO: idem. Should it not return the current value when not changed?
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
      if(!change) return null;

      return change.type === "replace" ? this.owner.get(name) : change.owner;
    },

    /**
     * Applies the contained changes to the owner complex value or, alternatively, to a given complex value.
     *
     * @param {pentaho.type.Complex} [target] - The value to which changes are applied.
     *
     * When unspecified, defaults to {@link pentaho.type.changes.ComplexChangeset#owner}.
     */
    apply: function(target) {

      var isAlternateTarget = !!target && target !== this.owner;

      if(!target) target = this.owner;

      this.propertyNames.forEach(function(property) {
        var change = this._changes[property];

        var subject;

        if(change instanceof Changeset) {
          // Get the corresponding changeset owner in the alternate target.
          if(isAlternateTarget) subject = target._values[property];

        } else {
          // PrimitiveChanges require a target to be specified.
          subject = target;
        }

        change.apply(subject);
      }, this);
    },
    //endregion

    _freeze: function() {
      O.eachOwn(this._changes, function(change) { change._freeze(); });
      Object.freeze(this._changes);
    }
  });

});
