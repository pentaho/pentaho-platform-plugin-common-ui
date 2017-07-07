/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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
  "../../util/error",
  "../../util/object"
], function(Change, error, O) {

  "use strict";

  return Change.extend("pentaho.type.changes.Changeset", /** @lends pentaho.type.changes.Changeset# */{

    /**
     * @alias Changeset
     * @memberOf pentaho.type.changes
     * @class
     * @extends pentaho.type.changes.Change
     * @amd pentaho/type/changes/Changeset
     * @abstract
     *
     * @classDesc The `Changeset` class describes a set of changes occurring in a structured value,
     * the [owner]{@link pentaho.type.changes.Changeset#owner} value.
     *
     * A changeset is a container for a set of
     * [PrimitiveChange]{@link pentaho.type.changes.PrimitiveChange} instances.
     *
     * @constructor
     * @description Creates an empty `Changeset` for a given owner value.
     *
     * @param {!pentaho.type.changes.Transaction} transaction - The owning transaction.
     * @param {!pentaho.type.UContainer} owner - The container instance where the changes take place.
     */
    constructor: function(transaction, owner) {
      if(!transaction) throw error.argRequired("transaction");
      if(!owner) throw error.argRequired("owner");

      /**
       * Gets the owning transaction.
       *
       * @name transaction
       * @memberOf pentaho.type.changes.Changeset#
       * @type {!pentaho.type.changes.Transaction}
       * @readOnly
       */
      O.setConst(this, "transaction", transaction);

      /**
       * Gets the container where the changes take place.
       *
       * @name owner
       * @memberOf pentaho.type.changes.Changeset#
       * @type {!pentaho.type.mixins.Container}
       * @readOnly
       */
      O.setConst(this, "owner", owner);

      this.__isReadOnly = false;
      this.__ownerVersion = owner.$version;

      // The longest path by which this changeset can be reached following the path of changesets
      // and their owner's references.
      this._netOrder = 0;

      transaction._addChangeset(this);
    },

    /**
     * Updates the order of this changeset to reflect its topological sort order.
     *
     * @param {number} netOrder - The net order.
     * @return {boolean} `true` if the order was updated; `false`, otherwise.
     * @private
     * @internal
     */
    __updateNetOrder: function(netOrder) {
      if(this._netOrder < netOrder) {
        this._netOrder = netOrder;
        return true;
      }
      return false;
    },

    // Should be marked protected abstract, but that would show in the docs.
    /**
     * Sets a nested changeset of this changeset.
     *
     * @name pentaho.type.changes.Changeset#__setNestedChangeset
     * @param {!pentaho.type.changes.Changeset} csetNested - The nested changeset.
     * @param {pentaho.type.Property.Type} propType - The property type whose value is the changeset owner.
     * Only applies when this changeset is a complex changeset.
     *
     * @private
     * @internal
     */

    /**
     * Throws an error if the changeset is read-only.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the changeset has been marked
     * [read-only]{@link pentaho.type.changes.Changeset#isReadOnly}.
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
     * @friend {pentaho.type.changes.Transaction}
     */
    __setReadOnlyInternal: function() {
      this.__isReadOnly = true;
    },

    /**
     * Gets the version of the owner at the time when the changeset was created.
     *
     * @type {number}
     * @readOnly
     */
    get ownerVersion() {
      return this.__ownerVersion;
    },

    /**
     * Gets a value that indicates if this changeset contains any changes,
     * whether they are primitive or in contained changesets.
     *
     * @name pentaho.type.changes.Changeset#hasChanges
     * @type {boolean}
     * @readOnly
     * @abstract
     */

    /**
     * Removes all changes from this changeset.
     *
     * Primitive changes are removed, while contained changesets are cleared.
     *
     * This method validates that the changeset is in a valid state and then delegates actual
     * work to the [_clearChanges]{@link pentaho.type.changes.Changeset#_clearChanges} method.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the changeset or any of its contained changesets
     * have been marked [read-only]{@link pentaho.type.changes.Changeset#isReadOnly}.
     *
     * @see pentaho.type.changes.Changeset#_clearChanges
     */
    clearChanges: function() {

      this._assertWritable();

      this._clearChanges();
    },

    /**
     * Actually removes all changes in the changeset.
     *
     * @name pentaho.type.changes.Changeset#_clearChanges
     * @method
     * @abstract
     * @protected
     * @see pentaho.type.changes.Changeset#clearChanges
     */

    /**
     * Applies the contained changes to the owner value and updates its version
     * to the given value.
     *
     * @param {number} version - The new owner version.
     *
     * @private
     * @friend {pentaho.type.changes.Transaction}
     */
    _applyInternal: function(version) {

      var owner = this.owner;

      this._apply(owner);

      // Update version
      owner.__setVersionInternal(version);
    }
  });
});
