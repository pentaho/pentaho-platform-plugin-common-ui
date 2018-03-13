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
  "./Changeset",
  "./ListChangeset",
  "./Replace",
  "./Transaction",
  "../../util/object"
], function(Changeset, ListChangeset, Replace, Transaction, O) {

  "use strict";

  var PROP_VALUE_DEFAULT = 0;
  var PROP_VALUE_SPECIFIED = 1;

  /**
   * @name ComplexChangeset
   * @memberOf pentaho.type.changes
   * @class
   * @extends pentaho.type.changes.Changeset
   *
   * @friend pentaho.type.Complex
   *
   * @amd pentaho/type/changes/ComplexChangeset
   *
   * @classDesc The class `ComplexChangeset` describes a set of changes to the values of properties
   * in a [complex]{@linkplain pentaho.type.Complex} value.
   *
   * @constructor
   * @description Creates a new instance.
   * @param {!pentaho.type.changes.Transaction} transaction - The owning transaction.
   * @param {!pentaho.type.Complex} owner - The complex value where the changes take place.
   */
  return Changeset.extend("pentaho.type.changes.ComplexChangeset", /** @lends pentaho.type.changes.ComplexChangeset#*/{

    constructor: function(transaction, owner) {
      this.base(transaction, owner);

      /**
       * A map of property name to a corresponding change.
       *
       * @type {!Object.<string, !pentaho.type.changes.Change>}
       * @protected
       * @readonly
       */
      this._changes = {};
    },

    /**
     * Gets the complex value where the changes take place.
     *
     * @name pentaho.type.changes.ComplexChangeset#owner
     * @type {!pentaho.type.Complex}
     * @readonly
     */

    // region public interface
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

    /** @inheritDoc */
    get hasChanges() {
      var changes = this._changes;
      for(var p in changes)
        if(O.hasOwn(changes, p) && __hasChanges(changes[p]))
          return true;

      return false;
    },

    /** @inheritDoc */
    _clearChanges: function() {
      var changes = this._changes;
      var complex = this.owner;

      for(var name in changes) {
        if(O.hasOwn(changes, name)) {
          var change = changes[name];
          if(change instanceof Changeset) {
            change.clearChanges();
          } else {
            // Primitive changes cannot be cleared; must be removed.
            // Assuming a Replace change...
            delete changes[name];
            change._cancelRefs(this.transaction, complex, /* valueIni: */complex.__getByName(name));
          }
        }
      }
    },

    /** @inheritDoc */
    __updateChildChangesetsNetOrder: function(childrenNetOrder) {
      var changes = this._changes;
      for(var name in changes) {
        if(O.hasOwn(changes, name)) {
          var change = changes[name];
          if(change instanceof Changeset) {
            change.__updateNetOrder(childrenNetOrder);
          }
        }
      }
    },

    /** @inheritDoc */
    __setNestedChangeset: function(csetNested, propType) {
      // Cannot set changesets like this over Replace changes, or the latter would be, well... , overwritten.
      // this._changes[propType.name] = csetNested;

      // getChange("foo") -> PrimitiveChange or Changeset
      // Case I - Replace without changes within the new value (apart from ref changes)
      // Replace
      //   (new) value : Value .$changeset = null

      // Lists, are never changed, and must always be copied.
      // The asymmetry comes from the fact that complex changesets cannot coexist with replaced values...

      var change = this._changes[propType.name];
      if(!change)
        this._changes[propType.name] = csetNested;
    },

    /**
     * Gets the [change]{@link pentaho.type.changes.Change} object associated with the specified property.
     *
     * @param {nonEmptyString|!pentaho.type.Property.Type} name - The property name or type object.
     *
     * @return {pentaho.type.changes.Change} An object describing the changes to be performed
     * in the given property, or `null` if the property has not changed.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `name` is not defined.
     */
    getChange: function(name) {
      var pName = this.owner.$type.get(name).name;
      return O.getOwn(this._changes, pName) || null;
    },

    /**
     * Determines if the given property has changed.
     *
     * @param {nonEmptyString|!pentaho.type.Property.Type} name - The property name or type object.
     *
     * @return {boolean} `true` if the property has changed; `false`, otherwise.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `name` is not defined.
     */
    hasChange: function(name) {
      var pName = this.owner.$type.get(name).name;
      return O.hasOwn(this._changes, pName) && __hasChanges(this._changes[pName]);
    },

    /**
     * Gets an array with the names of all of the changed properties contained in this changeset.
     *
     * @type {!Array.<string>}
     * @readonly
     */
    get propertyNames() {
      return Object.keys(this._changes)
          .filter(function(pName) {
            return __hasChanges(this._changes[pName]);
          }, this);
    },

    // TODO: Document me!
    // ATTENTION: This method's name and signature must be in sync with that of Complex#__getByName.
    // NOTE: Only called for element properties.
    __getByName: function(name) {
      var change = O.getOwn(this._changes, name);
      if(!change) return this.owner.__getByName(name);

      // If it's a changeset, it's a ComplexChangeset, bubbling. Otherwise, it's a `Replace` change.
      return (change instanceof Changeset) ? change.owner : change.value;
    },

    // ATTENTION: This method's name and signature must be in sync with that of Complex#__getStateByName.
    // NOTE: Can be called for both list and element properties.
    __getStateByName: function(name) {
      var change = O.getOwn(this._changes, name);
      if(!change) return this.owner.__getStateByName(name);

      // If it's a changeset, it's either a ComplexChangeset or a ListChangeset,
      // bubbling, which is considered _specifying_ the value.
      // Otherwise, it's a `Replace` change.
      return (change instanceof Changeset) ? PROP_VALUE_SPECIFIED : change.state;
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
      var pName = this.owner.$type.get(name).name;
      return this.owner.__getByName(pName);
    },

    /** @inheritDoc */
    _apply: function(target) {
      this.propertyNames.forEach(function(property) {
        var change = this[property];
        if((change instanceof Changeset)) {
          // Nested changes are considered as if they were locally specified.
          target.__valuesState[property] = PROP_VALUE_SPECIFIED;
        } else {
          change._apply(target);
        }
      }, this._changes);
    }
    // endregion
  }, {
    /**
     * Sets the value of an _element property_.
     *
     * @param {!pentaho.type.Complex} complex - The complex instance.
     * @param {!pentaho.type.Property.Type} propType - The element property type.
     * @param {?any} valueNewSpec The new value specification.
     * @param {?boolean} [forceReplace=false] Forces replace to occur even when values are equal.
     *
     * @private
     * @internal
     * @see pentaho.type.Complex#set
     */
    __setElement: function(complex, propType, valueNewSpec, forceReplace) {

      // NOTE: For performance reasons, this function inlines code that would otherwise be available from,
      // for example, Container#usingChangeset(.) and TransactionScope.
      var type = complex.$type;
      var name = propType.name;

      // Original/Initial value.
      var valueIni = complex.__getByName(name);
      var stateIni = complex.__getStateByName(name);

      // New value. Cast spec.
      var stateNew = valueNewSpec == null ? PROP_VALUE_DEFAULT : PROP_VALUE_SPECIFIED;
      var valueNew = propType.toValueOn(complex, valueNewSpec);

      // Ambient value.
      var cset = complex.$changeset;
      var change = cset !== null ? O.getOwn(cset._changes, name, null) : null;
      var valueAmb = change !== null ? change.value : valueIni;
      var stateAmb = change !== null ? change.state : stateIni;
      var isEqualValue = forceReplace ? false : type.areEqual(valueNew, valueAmb);

      // Doesn't change the ambient value/state?
      if(stateNew === stateAmb && isEqualValue) {
        return;
      }

      if(propType.isReadOnly) {
        throw new TypeError("'" + name + "' is read-only.");
      }

      if(change !== null) {
        // Goes back to the initial value/state?
        if(stateNew === stateIni && type.areEqual(valueNew, valueIni)) {
          // Remove the change.
          delete cset._changes[name];
          change._cancelRefs(cset.transaction, complex, valueIni);
        } else {
          // Update its value.
          // Preserve original instance if unchanged.
          change.__updateValue(cset.transaction, complex, isEqualValue ? valueAmb : valueNew, stateNew);
        }
        return;
      }

      // -- New change.

      var ctx = type.context;
      var scope = ctx.enterChange();
      var txn = scope.transaction;
      if(!cset) cset = complex._createChangeset(txn);

      // Create a change
      // Preserve original instance if unchanged.
      cset._changes[name] = change = new Replace(propType, isEqualValue ? valueAmb : valueNew, stateNew);
      change._prepareRefs(txn, complex, valueIni);

      scope.accept();
    }
  });

  function __hasChanges(change) {
    return !(change instanceof Changeset) || change.hasChanges;
  }
});
