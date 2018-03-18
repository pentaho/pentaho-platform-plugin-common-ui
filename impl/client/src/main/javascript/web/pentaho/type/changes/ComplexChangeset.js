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
      this._changes = Object.create(null);
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
      for(var name in changes)
        if(O.hasOwn(changes, name) && __hasChanges(changes[name]))
          return true;

      return false;
    },

    /**
     * Gets the [change]{@link pentaho.type.changes.Change} object associated with the specified property.
     *
     * @param {nonEmptyString|!pentaho.type.Property.Type} propertyOrName - The property name or type object.
     *
     * @return {pentaho.type.changes.Change} An object describing the changes to be performed
     * in the given property, or `null` if the property has not changed.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `propertyOrName` is not defined.
     */
    getChange: function(propertyOrName) {
      return this.__getChange(this.__resolvePropertyName(propertyOrName));
    },

    /**
     * Gets the [change]{@link pentaho.type.changes.Change} object associated with the specified property.
     *
     * @param {nonEmptyString} name - The property name.
     *
     * @return {pentaho.type.changes.Change} An object describing the changes to be performed
     * in the given property, or `null` if the property has not changed.
     *
     * @private
     */
    __getChange: function(name) {
      return O.getOwn(this._changes, name, null);
    },

    /**
     * Determines if the given property has changed.
     *
     * @param {nonEmptyString|!pentaho.type.Property.Type} propertyOrName - The property name or type object.
     *
     * @return {boolean} `true` if the property has changed; `false`, otherwise.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `propertyOrName` is not defined.
     */
    hasChange: function(propertyOrName) {
      return this.__hasChange(this.__resolvePropertyName(propertyOrName));
    },

    /**
     * Determines if the given property has changed.
     *
     * @param {nonEmptyString} name - The property name.
     *
     * @return {boolean} `true` if the property has changed; `false`, otherwise.
     *
     * @private
     */
    __hasChange: function(name) {
      return O.hasOwn(this._changes, name) && __hasChanges(this._changes[name]);
    },

    /**
     * Gets an array with the names of all of the changed properties contained in this changeset.
     *
     * @type {!Array.<string>}
     * @readonly
     */
    get propertyNames() {

      var changes = this._changes;

      return Object.keys(changes)
        .filter(function(name) {
          return __hasChanges(changes[name]);
        });
    },

    // TODO: Document me!
    // ATTENTION: This method's name and signature must be in sync with that of Complex#__getByName.
    // NOTE: Only called for element properties.
    __getByName: function(name) {
      var change = this.__getChange(name);
      if(change !== null) {
        // If it's a changeset, it's either a ComplexChangeset or a ListChangeset, bubbling.
        // Otherwise, it's a `Replace` change.
        return (change instanceof Changeset) ? change.owner : change.value;
      }

      return this.owner.__getByName(name);
    },

    // ATTENTION: This method's name and signature must be in sync with that of Complex#__getStateByName.
    // NOTE: Can be called for both list and element properties.
    __getStateByName: function(name) {
      var change = this.__getChange(name);
      if(change !== null) {
        // If it's a changeset, it's either a ComplexChangeset or a ListChangeset, bubbling,
        // which is considered _specifying_ the value.
        // Otherwise, it's a `Replace` change.
        return (change instanceof Changeset) ? PROP_VALUE_SPECIFIED : change.state;
      }

      return this.owner.__getStateByName(name);
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
    _eachChildChangeset: function(fun, ctx) {
      var changes = this._changes;
      for(var name in changes) {
        if(O.hasOwn(changes, name)) {
          var change = changes[name];
          if(change instanceof Changeset) {
            if(fun.call(ctx, change) === false) {
              return;
            }
          } else {
            // Also include the changeset of the value of a replace operation.
            var value = change.value;
            if(value !== null &&
               value.__addReference &&
               (change = this.transaction.getChangeset(value.$uid)) !== null) {

              if(fun.call(ctx, change) === false) {
                return;
              }
            }
          }
        }
      }
    },

    /** @inheritDoc */
    __onChildChangesetCreated: function(childChangeset, propType) {
      // Cannot set changesets like this over Replace changes, or the latter would be, well... , overwritten.
      // this._changes[propType.name] = childChangeset;

      // getChange("foo") -> PrimitiveChange or Changeset
      // Case I - Replace without changes within the new value (apart from ref changes)
      // Replace
      //   (new) value : Value .$changeset = null

      // Lists, are never changed, and must always be copied.
      // The asymmetry comes from the fact that complex changesets cannot coexist with replaced values...

      if(this.__getChange(propType.name) === null) {
        this._changes[propType.name] = childChangeset;

        this._setTransactionVersion(childChangeset.transactionVersion);
      }

      childChangeset.__updateNetOrder(this._netOrder + 1);
    },

    /**
     * Sets the change for a property.
     *
     * Updates the transaction version.
     *
     * @param {string} name - The property name.
     * @param {!pentaho.type.changes.Change} change - The change.
     *
     * @private
     */
    __setPrimitiveChange: function(name, change) {

      this._changes[name] = change;

      change._prepare(this);

      var txnVersion = this.transaction.__takeNextVersion();
      change._setTransactionVersion(txnVersion);
      this._setTransactionVersion(txnVersion);
    },

    /**
     * Removes a primitive change given the name of its property.
     *
     * Updates the transaction version.
     *
     * @param {string} name - The property name.
     *
     * @private
     */
    __removePrimitiveChange: function(name) {

      this._changes[name]._cancel(this);

      delete this._changes[name];

      this._setTransactionVersion(this.transaction.__takeNextVersion());
    },

    /**
     * Updates the current value of a replace change of a given property.
     *
     * Updates the transaction version.
     *
     * @param {string} name - The property name.
     * @param {pentaho.type.Element} valueNew - The new value.
     * @param {number} stateNew - The new state.
     *
     * @private
     */
    __updateReplaceChange: function(name, valueNew, stateNew) {

      var replaceChange = this._changes[name];

      replaceChange.__updateValue(this, valueNew, stateNew);

      this._setTransactionVersion(replaceChange.transactionVersion);
    },

    /**
     * Marks an element as added by a change or cancels a previous removal.
     * @param {!pentaho.type.Complex} element - The added element.
     * @param {!pentaho.type.Property.Type} propType - The property type.
     * @private
     * @internal
     */
    __addComplexElement: function(element, propType) {

      // The transaction version is already affected by the
      // __setPrimitiveChange, __removePrimitiveChange and __updateReplaceChange methods.

      this.transaction.__ensureChangeRef(element).addReference(this.owner, propType);

      var childChangeset = element.__cset;
      if(childChangeset !== null) {
        // Make sure that the new changeset descendants have at least our topological order.
        childChangeset.__updateNetOrder(this._netOrder + 1);
      }
    },

    /**
     * Marks an element as removed by a change or cancels a previous addition.
     * @param {!pentaho.type.Complex} element - The removed element.
     * @param {!pentaho.type.Property.Type} propType - The property type.
     * @private
     * @internal
     */
    __removeComplexElement: function(element, propType) {

      // The transaction version is already affected by the
      // __setPrimitiveChange, __removePrimitiveChange and __updateReplaceChange methods.

      this.transaction.__ensureChangeRef(element).removeReference(this.owner, propType);

      var childChangeset = element.__cset;
      if(childChangeset !== null) {
        // Make sure that the changeset descendants update its new topological order.
        childChangeset._resetNetOrder();
      }
    },

    /**
     * Obtain the name of a property, given the property type or its name.
     *
     * @param {nonEmptyString|!pentaho.type.Property.Type} propertyOrName - The property name or type object.
     *
     * @return {string} The property name.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `propertyOrName` is not defined.
     *
     * @private
     */
    __resolvePropertyName: function(propertyOrName) {
      return this.owner.$type.get(propertyOrName).name;
    },

    /** @inheritDoc */
    _clearChanges: function() {

      var changes = this._changes;

      // TODO: Define clearChanges semantics.
      // Should it clear child changesets as seen before or after clearing local changes?

      for(var name in changes) {
        if(O.hasOwn(changes, name)) {
          var change = changes[name];
          if(change instanceof Changeset) {
            change._clearChangesRecursive(this);
          } else {
            // Primitive changes cannot be cleared; must be removed.
            // Assuming a Replace change...
            delete changes[name];
            change._cancel(this);
          }
        }
      }
    },

    /** @inheritDoc */
    _apply: function(target) {

      var changes = this._changes;

      for(var name in changes) {
        if(O.hasOwn(changes, name)) {
          var change = changes[name];
          if((change instanceof Changeset)) {
            if(change.hasChanges) {
              // Nested changes are considered as if they were locally specified.
              target.__valuesState[name] = PROP_VALUE_SPECIFIED;
            }
          } else {
            change._apply(target);
          }
        }
      }
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
      var changeset = complex.$changeset;
      var replaceChange = null;
      if(changeset !== null) {
        replaceChange = changeset.__getChange(name);
        // If the current value is complex and was previously changed, then there's already a hooked changeset.
        // A replace change is "stronger", though, and will shadow the changeset.
        if(replaceChange !== null && (replaceChange instanceof Changeset)) {
          replaceChange = null;
        }
      }

      var valueAmb = replaceChange !== null ? replaceChange.value : valueIni;
      var stateAmb = replaceChange !== null ? replaceChange.state : stateIni;
      var isEqualValue = forceReplace ? false : type.areEqual(valueNew, valueAmb);

      // Doesn't change the ambient value/state?
      if(stateNew === stateAmb && isEqualValue) {
        return;
      }

      if(propType.isReadOnly) {
        throw new TypeError("'" + name + "' is read-only.");
      }

      if(replaceChange !== null) {
        // Goes back to the initial value/state?
        if(stateNew === stateIni && type.areEqual(valueNew, valueIni)) {
          changeset.__removePrimitiveChange(name);
        } else {
          // Update its value/state.
          // Preserve original value if unchanged.
          changeset.__updateReplaceChange(name, isEqualValue ? valueAmb : valueNew, stateNew);
        }

        return;
      }

      // -- New change.

      var context = type.context;
      var scope = context.enterChange();
      if(changeset === null) {
        changeset = scope.transaction.ensureChangeset(complex);
      }

      // Create a change. Preserve original instance if unchanged.
      changeset.__setPrimitiveChange(
        name,
        new Replace(propType, isEqualValue ? valueAmb : valueNew, stateNew, valueIni));

      scope.accept();
    }
  });

  /**
   * Gets a value that indicates if a change has changes.
   * @param {!pentaho.type.changes.Change} change - The change.
   * @return {boolean} `true` if yes; `false` if no.
   */
  function __hasChanges(change) {
    return !(change instanceof Changeset) || change.hasChanges;
  }
});
