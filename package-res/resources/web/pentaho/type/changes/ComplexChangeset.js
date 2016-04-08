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
      if(!owner) throw error.argRequired("owner");
      this.base(owner);

      this._changes = {};
    },

    //region public interface
    /**
     * @inheritdoc
     */
    get type() {
      return "complexChangeset";
    },

    /**
     * Asserts if this changeset contains any defined changes.
     *
     * @return {boolean} `true` if at least one property change is defined,
     * `false` if no property changes are defined.
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
      return pName ? O.getOwn(this._changes, pName, null) : null;
    },

    /**
     * Determines if this changeset contains the specified property.
     *
     * @param {nonEmptyString|!pentaho.type.Property.Type} name - The property name or type object.
     *
     * @return {boolean} `true` if the property exists and is referenced in this changeset,
     * `false` if the property does not exist or is not referenced.
     */
    has: function(name) {
      var pName = this.owner.type.get(name).name;
      return pName && O.hasOwn(this._changes, pName);
    },

    /**
     * Gets an array with all of the property names contained in this changeset.
     *
     * @type !string[]
     * @readonly
     */
    get propertyNames() {
      return Object.keys(this._changes);
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
        this._changes[pName] = new ListChangeset(value0, valueSpec);
      } else {
        var value1 = pType.toValue(valueSpec);

        if(!pType.type.areEqual(value0, value1)) {
          this._changes[pName] = new Replace(pName, value1);
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
    get: function(name) {
      if(!this.has(name)) return null;

      var change = this.getChange(name);
      if(change.type === "replace")
        return change._value;
      else
        return change.newValue;
    },

    /**
     * Gets the original value of a property.
     *
     * @param {nonEmptyString|!pentaho.type.Property.Type} name - The property name or type object.
     *
     * @return {pentaho.type.Value} The original value of the property (before the change).
     */
    getOld: function(name) {
      if(!this.has(name)) return null;

      var change = this.getChange(name);
      if(change.type === "replace")
        return this.owner.get(name);
      else
        return change.oldValue;
    },

    /**
     * Updates the provided [complex]{@linkplain pentaho.type.Complex} with the changes in this changeset.
     * If the argument is omitted, the changeset is applying in the owning complex.
     *
     *  @param {!pentaho.type.Complex} [complex=this.owner] - The [complex]{@linkplain pentaho.type.Complex} object associated with this change.
     */
    apply: function(complex) {
      if(!complex) complex = this.owner;

      this.propertyNames.forEach(function(property) {
        var change = this.getChange(property);
        var subject = change.type === "replace" ? complex : complex._values[property];
        change.apply(subject);
      }, this);
    },
    //endregion

    //region protected methods
    /**
     * Prevents further changes to this changeset.
     * @protected
     */
    freeze: function() {
      O.eachOwn(this._changes, function(change) {
        if(change) change.freeze();
      });
      Object.freeze(this._changes);
    }

    //endregion

  });

});
