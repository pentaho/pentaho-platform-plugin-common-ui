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
  "../lang/Base",
  "../lang/EventSource",
  "./ReferenceList",
  "./changes/Transaction",
  "./events/WillChange",
  "./events/RejectedChange",
  "./events/DidChange"
], function(Base, EventSource, ReferenceList, Transaction, WillChange, RejectedChange, DidChange) {

  "use strict";

  /**
   * The unique id number of the next created container.
   *
   * @type {number}
   */
  var _nextUid = 1;

  /**
   * @name pentaho.type.ContainerMixin
   * @class
   * @extends pentaho.lang.Base
   * @mixes pentaho.lang.EventSource
   *
   * @classDesc The `ContainerMixin` class contains functionality that is shared
   * by the instance container classes [Complex]{@link pentaho.type.Complex} and [List]{@link pentaho.type.List}.
   */
  return Base.extend("pentaho.type.ContainerMixin", /** @lends pentaho.type.ContainerMixin# */{

    /**
     * Initializes a container instance, with a unique identifier and a version field.
     *
     * @private
     */
    _initContainer: function() {
      /**
       * Container unique identifier.
       *
       * @type {string}
       */
      this._uid = String(_nextUid++);

      /**
       * Version number.
       *
       * Updated with each transaction's version on Transaction#_commit.
       * @type {number}
       */
      this._vers = 0;

      /**
       * Ambient Changeset. Set whenever this container has a changeset in the ambient transaction.
       *
       * @type {pentaho.type.changes.Changeset}
       */
      this._cset = null;

      /**
       * References (from others) to this container.
       *
       * Maintained by ContainerMixin#_addReference and Changeset#_updateReferences.
       *
       * @type {pentaho.type.ReferenceList}
       */
      this._refs = null;
    },

    /**
     * Initializes a container instance clone.
     *
     * @param {!pentaho.type.ContainerMixin} clone - The cloned container instance.
     *
     * @private
     */
    _cloneContainer: function(clone) {
      clone._initContainer();
    },

    /**
     * Gets the unique identifier of the instance.
     *
     * @type {string}
     * @readonly
     */
    get $uid() {
      return this._uid;
    },

    // region References
    // TODO: document IReference...
    /**
     * Gets the references to this container, or `null`, if none.
     *
     * Note that the returned array may be empty.
     *
     * Do **NOT** change the returned array or its elements in any way.
     *
     * @type {Array.<Object>}
     * @readOnly
     */
    get $references() {
      var cref;
      var txn = this.type.context.transaction;
      return (txn && (cref = txn._getChangeRef(this._uid))) ? cref.projectedReferences : this._refs;
    },

    /**
     * Adds a reference to this instance.
     *
     * This method is only used internally by Complex#constructor, List#constructor and Complex#clone,
     * for when the internal fields are updated directly, for performance and for working
     * outside of any ambient txn. The _removeReference counterpart is not needed.
     *
     * @param {!pentaho.type.ContainerMixin} container - The container that refers this one.
     * @param {pentaho.type.Property.Type} [propType] When `container` is a complex,
     * the property type whose value contains this instance.
     *
     * @private
     */
    _addReference: function(container, propType) {
      (this._refs || (this._refs = ReferenceList.to([]))).add(container, propType);
    },
    // endregion

    // region version
    /**
     * Gets the current version of the instance.
     *
     * @type {number}
     * @readonly
     */
    get $version() {
      return this._vers;
    },

    /**
     * Sets the new version of the instance.
     *
     * @param {number} version - The new container version.
     *
     * @private
     * @friend {pentaho.type.changes.Changeset}
     */
    _setVersionInternal: function(version) {
      this._vers = version;
    },
    // endregion

    // region Changes
    /**
     * Gets the changeset of this instance in the ambient transaction, if any, or `null`.
     *
     * @type {pentaho.type.changes.Changeset}
     * @readonly
     */
    get changeset() {
      return this._cset;
    },

    get hasChanges() {
      return !!this._cset && this._cset.hasChanges;
    },

    _usingChangeset: function(fun) {
      var cset = this._cset;
      if(cset) return fun.call(this, cset);

      var scope = this.type.context.enterChange();

      return scope.using(function() {

        cset = this._createChangeset(scope.transaction);

        // assert this._cset === cset

        var result = fun.call(this, cset);

        scope.accept();

        return result;
      }, this); // assert !this._cset
    },

    /**
     * Creates a changeset with this container as owner and returns it.
     *
     * @name pentaho.type.ContainerMixin#_createChangeset
     *
     * @param {!pentaho.type.changes.Transaction} transaction - The owning transaction.
     *
     * @return {pentaho.type.changes.Changeset} A changeset of appropriate type.
     *
     * @abstract
     */

    /**
     * Emits the "will:change" event for a given changeset,
     * if there are any listeners.
     *
     * @param {!pentaho.type.changes.Changeset} changeset - The set of changes.
     *
     * @return {pentaho.lang.UserError|undefined} An error if the changeset was canceled; or, `undefined` otherwise.
     *
     * @private
     * @friend {pentaho.type.changes.Transaction}
     */
    _notifyChangeWill: function(changeset) {
      var event;
      if(this._hasListeners("will:change") &&
         !this._emitSafe((event = new WillChange(this, changeset))))
        return event.cancelReason;
    },

    /**
     * Emits the "did:change" event for a given changeset,
     * if there are any listeners.
     *
     * @param {!pentaho.type.changes.Changeset} changeset - The set of changes.
     *
     * @private
     * @friend {pentaho.type.changes.Transaction}
     */
    _notifyChangeDid: function(changeset) {
      if(this._hasListeners("did:change")) {
        this._emitSafe(new DidChange(this, changeset));
      }
    },

    /**
     * Emits the "rejected:change" event for a given changeset,
     * if there are any listeners.
     *
     * @param {!pentaho.type.changes.Changeset} changeset - The set of changes.
     * @param {!Error} reason - The reason why the changes were rejected.
     *
     * @private
     * @friend {pentaho.type.changes.Transaction}
     */
    _notifyChangeRej: function(changeset, reason) {
      if(this._hasListeners("rejected:change")) {
        this._emitSafe(new RejectedChange(this, changeset, reason));
      }
    }
    // endregion
  })
  .implement(EventSource);
});
