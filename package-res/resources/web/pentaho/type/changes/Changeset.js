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
  "../../util/error"
], function(Change, error) {
  "use strict";

  var PhaseWill = 0,
      PhaseDid  = 1,
      PhaseRejected = 2;

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
     * @param {!pentaho.type.UStructuredValue} owner - The structured value where the changes take place.
     */
    constructor: function(owner) {
      if(!owner) throw error.argRequired("owner");

      this._owner = owner;

      // TODO: Temporary. Remove when transactions allow multiple changesets per owner.
      owner._changeset = this;

      /**
       * The current phase of the changeset.
       *
       * * `0` - will - unapplied - mutable.
       * * `1` - did  - applied.
       * * `2` - rejected - rejected.
       *
       * @private
       * @type {number}
       * @default 0
       */
      this._phase = PhaseWill;
    },

    /**
     * Throws an error if the changeset is not in a mutable state.
     *
     * @throws {pentaho.lang.OperationInvalid} When the changeset has already been applied or rejected.
     *
     * @protected
     */
    _assertMutable: function() {
      if(this._phase !== PhaseWill) throw error.operInvalid("Changeset is readonly.");
    },

    /**
     * Gets the structured value where the changes take place.
     *
     * @type {!pentaho.type.UStructuredValue}
     * @readOnly
     */
    get owner() {
      return this._owner;
    },

    /**
     * Gets a value that indicates if there are any changes.
     *
     * @type {boolean}
     * @readOnly
     */
    get hasChanges() {
      return false;
    },

    /**
     * Removes all changes.
     */
    clearChanges: function() {
      throw error.notImplemented("clearChanges");
    },

    /**
     * Applies the contained changes to the owner value.
     *
     * @throws {pentaho.lang.OperationInvalid} When the changeset has already been applied or rejected.
     */
    apply: function() {

      this._assertMutable();

      // Mark as applied.
      this._phase = PhaseDid;

      // Clear the owner's current changeset.
      // TODO: Temporary. Remove when transactions allow multiple changesets per owner.
      // NOTE: Can only clear at the end of Will so that changes during the Will event use the same changeset.
      // Must clear at the end of Will so that any changes in later events initiate new changesets.
      this._owner._changeset = null;

      this._apply(this._owner);
    },

    /**
     * Rejects the changes in the changeset.
     *
     * @throws {pentaho.lang.OperationInvalid} When the changeset has already been applied or rejected.
     */
    reject: function() {

      this._assertMutable();

      // Mark as rejected.
      this._phase = PhaseRejected;

      // Clear the owner's current changeset.
      // TODO: Temporary. Remove when transactions allow multiple changesets per owner.
      this._owner._changeset = null;

      this._reject();
    },

    /**
     * Actually rejects the changes in the changeset.
     *
     * Override to reject any contained changesets.
     */
    _reject: function() {
    }
  });
});