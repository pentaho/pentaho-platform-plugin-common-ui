/*!
 * Copyright 2010 - 2019 Hitachi Vantara. All rights reserved.
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
  "module",
  "./Change",
  "pentaho/util/error",
  "pentaho/util/object"
], function(module, Change, error, O) {

  "use strict";

  return Change.extend(module.id, /** @lends pentaho.type.action.Changeset# */{

    /**
     * @alias Changeset
     * @memberOf pentaho.type.action
     * @class
     * @extends pentaho.type.action.Change
     * @amd pentaho/type/action/Changeset
     * @abstract
     *
     * @classDesc The `Changeset` class describes a set of changes occurring in a structured value,
     * the [target]{@link pentaho.type.action.Changeset#target} value.
     *
     * A changeset is a container for a set of
     * [PrimitiveChange]{@link pentaho.type.action.PrimitiveChange} instances.
     *
     * @constructor
     * @description Creates an empty `Changeset` for a given target value.
     *
     * @param {pentaho.type.action.Transaction} transaction - The owning transaction.
     * @param {pentaho.type.mixins.Container} target - The container instance where the changes take place.
     */
    constructor: function(transaction, target) {
      if(!transaction) throw error.argRequired("transaction");
      if(!target) throw error.argRequired("target");

      /**
       * Gets the owning transaction.
       *
       * @name transaction
       * @memberOf pentaho.type.action.Changeset#
       * @type {pentaho.type.action.Transaction}
       * @readOnly
       */
      O.setConst(this, "transaction", transaction);

      /**
       * Gets the container where the changes take place.
       *
       * @name target
       * @memberOf pentaho.type.action.Changeset#
       * @type {pentaho.type.mixins.Container}
       * @readOnly
       */
      O.setConst(this, "target", target);

      this.__isReadOnly = false;
      this.__targetVersion = target.$version;

      // The longest path by which this changeset can be reached following the paths from parent to children changesets.
      this._netOrder = 0;

      this.__txnVersion = this.__txnVersionLocal = transaction.version;
      this.__txnVersionDirty = false;
    },

    // region Topological order
    /**
     * Updates the topological order of this changeset, and of any child changesets,
     * to the given value, if it's less than it.
     *
     * @param {number} netOrder - The net order.
     * @private
     * @internal
     */
    __updateNetOrder: function(netOrder) {
      if(this._netOrder < netOrder) {

        this.__setNetOrder(netOrder);

        var childNetOrder = netOrder + 1;
        this.eachChildChangeset(function(changeset) {
          changeset.__updateNetOrder(childNetOrder);
        });
      }
    },

    /**
     * Resets the topological order of this changeset,
     * and of any child changesets,
     * by calculating it based on its current parents.
     *
     * @protected
     * @see pentaho.type.action.Changeset#__calculateNetOrder
     */
    _resetNetOrder: function() {

      this.__setNetOrder(this.__calculateNetOrder());

      this.eachChildChangeset(function(changeset) {
        changeset.__resetNetOrder();
      });
    },

    /**
     * Sets the topological order of this changeset to the given value.
     *
     * Notifies the transaction by calling `__onChangesetNetOrderChangeWill`.
     *
     * @param {number} netOrder - The topological order.
     *
     * @private
     */
    __setNetOrder: function(netOrder) {

      var previousNetOrder = this._netOrder;
      if(previousNetOrder !== netOrder) {
        // Notify transaction in case the commit-will phase is evaluating.

        var callbackChangeDid = this.transaction.__onChangesetNetOrderChangeWill(this);

        this._netOrder = netOrder;

        if(callbackChangeDid !== null) {
          callbackChangeDid();
        }
      }
    },

    /**
     * Calculates the topological order of this changeset based on the topological order of its current parents.
     *
     * @return {number} The topological order.
     *
     * @private
     */
    __calculateNetOrder: function() {

      var maxParentOrder = 0;
      var transaction = this.transaction;
      var irefs = transaction.getAmbientReferences(this.target);
      if(irefs !== null) {
        var i = irefs.length;
        while(i--) {
          var containerChangeset = irefs[i].container.__cset;
          if(containerChangeset !== null && containerChangeset._netOrder >= maxParentOrder) {
            maxParentOrder = containerChangeset._netOrder;
          }
        }
      }

      return maxParentOrder + 1;
    },
    // endregion

    // Should be marked protected abstract, but that would show in the docs.
    /**
     * Adds a new child changeset to this parent changeset.
     *
     * @name pentaho.type.action.Changeset#__onChildChangesetCreated
     * @method
     * @param {pentaho.type.action.Changeset} childChangeset - The child changeset.
     * @param {pentaho.type.PropertyType} propType - The property type whose value is the changeset target.
     * Only applies when this changeset is a complex changeset.
     *
     * @private
     * @internal
     * @see pentaho.type.action.Transaction#__addChangeset
     */

    /**
     * Calls a function once per child changeset.
     *
     * @name pentaho.type.action.Changeset#eachChildChangeset
     * @method
     * @param {function(pentaho.type.changeset.Changeset) : undefined|boolean} fun - The function to call.
     * @param {*} ctx - The `this` context on which to call `fun`.
     *
     * @abstract
     */

    // region Read-only / Writable
    /**
     * Throws an error if the changeset is read-only.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the changeset has been marked
     * [read-only]{@link pentaho.type.action.Changeset#isReadOnly}.
     *
     * @protected
     */
    _assertWritable: function() {
      if(this.isReadOnly) throw error.operInvalid("Changeset is read-only.");
    },

    /**
     * Gets a value that indicates if the changeset is in a read-only state
     * and can no longer be modified.
     *
     * @type {boolean}
     * @readOnly
     */
    get isReadOnly() {
      return this.__isReadOnly;
    },

    /**
     * Sets the changeset to a read-only state.
     *
     * @private
     * @internal
     * @friend {pentaho.type.action.Transaction}
     */
    __setReadOnlyInternal: function() {
      this.__isReadOnly = true;
    },
    // endregion

    // region Versions
    /**
     * Gets the version of the target at the time when the changeset was created.
     *
     * @type {number}
     * @readOnly
     */
    get targetVersion() {
      return this.__targetVersion;
    },

    /**
     * Gets the local transaction version of this changeset.
     *
     * This number is the maximum transaction version of the contained primitive changes.
     *
     * @type {number}
     * @readOnly
     */
    get transactionVersionLocal() {
      return this.__txnVersionLocal;
    },

    /**
     * Gets the transaction version of this changeset.
     *
     * This number is at least as high as the transaction version of any child changesets and primitive changes.
     *
     * @type {number}
     * @readOnly
     */
    get transactionVersion() {

      if(this.__txnVersionDirty) {
        this.__txnVersion = this.__calcCleanTransactionVersion();
        this.__txnVersionDirty = false;
      }

      return this.__txnVersion;
    },

    /**
     * Calculates the transaction version by taking the maximum
     * of the local value and that of the child changesets.
     *
     * @return {number} The new transaction version.
     * @private
     */
    __calcCleanTransactionVersion: function() {

      var txnVersion = this.__txnVersionLocal;

      this.eachChildChangeset(function(changeset) {

        var childTxnVersion = changeset.transactionVersion;
        if(childTxnVersion > txnVersion) {
          txnVersion = childTxnVersion;
        }
      });

      return txnVersion;
    },

    /**
     * Updates the transaction version to a given value, if it is greater than the current one.
     * Notifies all parents, except the optionally specified one,
     * that their version is dirty.
     *
     * @param {number} txnVersion - The new transaction version.
     * @param {pentaho.type.action.Changeset} [noNotifyParentChangeset=null] - The parent changeset that should not
     * be notified.
     *
     * @protected
     * @final
     */
    _setTransactionVersion: function(txnVersion, noNotifyParentChangeset) {

      if(txnVersion > this.__txnVersion) {

        // Force update dirty transaction version or we could loose
        // the dirty state
        this.__txnVersion = txnVersion;
        this.__txnVersionDirty = false;

        // Notify all parents except noNotifyParentChangeset.
        this.__notifyParentsTxnVersionDirty(noNotifyParentChangeset);
      }
    },

    /**
     * Updates the local transaction version to a given value due to a local, primitive change,
     * if it is greater than the current one.
     * Then, it calls [_setTransactionVersion]{@link pentaho.type.action.Changeset#_setTransactionVersion}
     * with the same arguments.
     *
     * @param {number} txnVersionLocal - The new local transaction version.
     * @param {pentaho.type.action.Changeset} [noNotifyParentChangeset=null] - The parent changeset that should not
     * be notified.
     *
     * @protected
     * @final
     */
    _setTransactionVersionLocal: function(txnVersionLocal, noNotifyParentChangeset) {

      if(txnVersionLocal > this.__txnVersionLocal) {

        // Force update dirty transaction version or we could loose
        // the dirty state
        this.__txnVersionLocal = txnVersionLocal;

        // Notify all parents except noNotifyParentChangeset.
        this._setTransactionVersion(txnVersionLocal, noNotifyParentChangeset);

        // Notify the transaction, in case the commit will phase is evaluating.
        this.transaction.__onChangesetLocalVersionChangeDid(this);
      }
    },

    /**
     * Notifies all parent changesets, except the optionally specified one,
     * that their version is dirty.
     *
     * @param {pentaho.type.action.Changeset} noNotifyParentChangeset - A parent changeset that should not
     * be notified.
     *
     * @private
     */
    __notifyParentsTxnVersionDirty: function(noNotifyParentChangeset) {

      var irefs = this.transaction.getAmbientReferences(this.target);
      if(irefs !== null) {
        var L = irefs.length;
        var i = -1;
        while(++i < L) {
          var parentChangeset = irefs[i].container.__cset;
          if(parentChangeset !== noNotifyParentChangeset) {
            // assert parentChangeset !== null
            parentChangeset.__onChildTxnVersionDirty();
          }
        }
      }
    },

    /**
     * Called by a child changeset when its version changes or becomes dirty.
     */
    __onChildTxnVersionDirty: function() {
      if(!this.__txnVersionDirty) {
        this.__txnVersionDirty = true;
        this.__notifyParentsTxnVersionDirty(null);
      }
    },
    // endregion

    /**
     * Gets a value that indicates if this changeset contains any changes,
     * whether they are primitive or in contained changesets.
     *
     * @name pentaho.type.action.Changeset#hasChanges
     * @type {boolean}
     * @readOnly
     * @abstract
     */

    // region clearChanges

    // TODO: Define clearChanges semantics.
    // Should it clear child changesets as seen before or after clearing local changes?

    /**
     * Removes all changes from this changeset.
     *
     * Primitive changes are removed, while contained changesets are cleared.
     *
     * This method validates that the changeset is in a valid state and then delegates actual
     * work to the [_clearChangesRecursive]{@link pentaho.type.action.Changeset#_clearChangesRecursive} method.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the changeset or any of its contained changesets
     * have been marked [read-only]{@link pentaho.type.action.Changeset#isReadOnly}.
     *
     * @see pentaho.type.action.Changeset#_clearChanges
     * @see pentaho.type.action.Changeset#_clearChangesRecursive
     */
    clearChanges: function() {

      this._assertWritable();

      this._clearChangesRecursive(null);
    },

    /**
     * Called by a parent changeset on its child changeset, this, for it to clear its changes.
     *
     * This method updates the transaction version of this changeset to match the parent's version
     * and then delegates to the [_clearChanges]{@link pentaho.type.action.Changeset#_clearChanges} method.
     *
     * @param {pentaho.type.action.Changeset} parentChangeset - The parent changeset.
     *
     * @protected
     * @see pentaho.type.action.Changeset#transactionVersion
     * @see pentaho.type.action.Changeset#clearChanges
     */
    _clearChangesRecursive: function(parentChangeset) {

      var txnVersion = parentChangeset != null
        ? parentChangeset.transactionVersion
        : this.transaction.__takeNextVersion();

      // This is also a local change.
      this._setTransactionVersionLocal(txnVersion, parentChangeset);

      this._clearChanges();
    },

    /**
     * Actually removes all changes from this changeset.
     *
     * @name pentaho.type.action.Changeset#_clearChanges
     * @method
     * @abstract
     * @protected
     * @see pentaho.type.action.Changeset#clearChanges
     */
    // endregion

    /**
     * Applies the contained changes to the target value and updates its version
     * to the given value.
     *
     * @param {number} version - The new target version.
     *
     * @private
     * @friend {pentaho.type.action.Transaction}
     */
    _applyInternal: function(version) {

      var target = this.target;

      this._apply(target);

      // Update version
      target.__setVersionInternal(version);
    }
  });
});
