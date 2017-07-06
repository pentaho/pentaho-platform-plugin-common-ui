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
  "../../lang/Base",
  "../../lang/EventSource",
  "../ReferenceList",
  "../changes/Transaction",
  "../events/WillChange",
  "../events/RejectedChange",
  "../events/DidChange"
], function(Base, EventSource, ReferenceList, Transaction, WillChange, RejectedChange, DidChange) {

  "use strict";

  /**
   * The unique id number of the next created container.
   *
   * @type {number}
   */
  var __nextUid = 1;

  /**
   * @name pentaho.type.mixins.Container
   * @class
   * @extends pentaho.lang.Base
   * @extends pentaho.lang.EventSource
   *
   * @classDesc A mixin class that contains functionality shared by the
   * instance container classes: [Complex]{@link pentaho.type.Complex} and [List]{@link pentaho.type.List}.
   *
   * @description This class was not designed to be constructed directly. It was designed to be used as a **mixin**.
   */
  return Base.extend("pentaho.type.mixins.Container", /** @lends pentaho.type.mixins.Container# */{

    /**
     * Initializes a container instance.
     *
     * @protected
     */
    _initContainer: function() {
      /**
       * Container unique identifier.
       *
       * @memberOf pentaho.type.mixins.Container#
       * @type {string}
       * @private
       */
      this.__uid = String(__nextUid++);

      /**
       * Version number.
       *
       * Updated with each transaction's version on Transaction#_commit.
       *
       * @memberOf pentaho.type.mixins.Container#
       * @type {number}
       * @private
       */
      this.__version = 0;

      /**
       * Ambient Changeset. Set whenever this container has a changeset in the ambient transaction.
       *
       * @memberOf pentaho.type.mixins.Container#
       * @type {pentaho.type.changes.Changeset}
       * @private
       * @internal
       */
      this.__cset = null;

      /**
       * References (from others) to this container.
       *
       * Maintained by Container#__addReference and Changeset#_updateReferences.
       *
       * @memberOf pentaho.type.mixins.Container#
       * @type {pentaho.type.ReferenceList}
       * @private
       * @internal
       */
      this.__refs = null;
    },

    /**
     * Creates a shallow clone of this container.
     *
     * All property values or elements are shared with the clone.
     *
     * @return {!pentaho.type.ContainerMixin} The cloned container.
     */
    clone: function() {
      var clone = Object.create(Object.getPrototypeOf(this));
      this._initClone(clone);
      return clone;
    },

    /**
     * Initializes a shallow clone of this container.
     *
     * The default implementation calls {@link pentaho.type.mixins.Container#_initContainer}.
     *
     * @param {!pentaho.type.ContainerMixin} clone - The cloned container to initialize.
     *
     * @protected
     */
    _initClone: function(clone) {
      clone._initContainer();
    },

    /**
     * Gets the unique identifier of the instance.
     *
     * @type {string}
     * @readonly
     */
    get $uid() {
      return this.__uid;
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
      return (txn && (cref = txn._getChangeRef(this.__uid))) ? cref.projectedReferences : this.__refs;
    },

    /**
     * Adds a reference to this instance.
     *
     * This method is only used internally by Complex#constructor, List#constructor and Complex#clone,
     * for when the internal fields are updated directly, for performance and for working
     * outside of any ambient txn. The _removeReference counterpart is not needed.
     *
     * @param {!pentaho.type.mixins.Container} container - The container that refers this one.
     * @param {pentaho.type.Property.Type} [propType] When `container` is a complex,
     * the property type whose value contains this instance.
     *
     * @private
     * @internal
     */
    __addReference: function(container, propType) {
      (this.__refs || (this.__refs = ReferenceList.to([]))).add(container, propType);
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
      return this.__version;
    },

    /**
     * Sets the new version of the instance.
     *
     * @param {number} version - The new container version.
     *
     * @private
     * @internal
     * @friend {pentaho.type.changes.Changeset}
     * @friend {pentaho.data.filter.Abstract}
     */
    __setVersionInternal: function(version) {
      this.__version = version;
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
      return this.__cset;
    },

    // TODO: Maybe remove
    get hasChanges() {
      return !!this.__cset && this.__cset.hasChanges;
    },

    // @internal
    __usingChangeset: function(fun) {
      var cset = this.__cset;
      if(cset) return fun.call(this, cset);

      var scope = this.type.context.enterChange();

      return scope.using(function() {

        cset = this._createChangeset(scope.transaction);

        // assert this.__cset === cset

        var result = fun.call(this, cset);

        scope.accept();

        return result;
      }, this); // assert !this.__cset
    },

    /**
     * Creates a changeset with this container as owner and returns it.
     *
     * @name pentaho.type.mixins.Container#_createChangeset
     *
     * @method
     *
     * @param {!pentaho.type.changes.Transaction} transaction - The transaction that owns this changeset.
     *
     * @return {!pentaho.type.changes.Changeset} A changeset of the appropriate type.
     *
     * @abstract
     * @protected
     */

    /**
     * Called before a changeset is committed.
     *
     * The default implementation emits the "will:change" event for the given changeset,
     * if there are any listeners.
     *
     * When overriding, be sure to call the base implementation.
     *
     * @param {!pentaho.type.changes.Changeset} changeset - The set of changes.
     *
     * @return {pentaho.lang.UserError|undefined} An error if the changeset was canceled; or, `undefined` otherwise.
     *
     * @protected
     * @internal
     * @friend {pentaho.type.changes.Transaction}
     */
    _onChangeWill: function(changeset) {
      var event;
      if(this._hasListeners("will:change") &&
         !this._emitSafe((event = new WillChange(this, changeset))))
        return event.cancelReason;
    },

    /**
     * Called after a changeset has been committed.
     *
     * The default implementation emits the "did:change" event for the given changeset,
     * if there are any listeners.
     *
     * When overriding, be sure to call the base implementation.
     *
     * @param {!pentaho.type.changes.Changeset} changeset - The set of changes.
     *
     * @protected
     * @internal
     * @friend {pentaho.type.changes.Transaction}
     */
    _onChangeDid: function(changeset) {
      if(this._hasListeners("did:change")) {
        this._emitSafe(new DidChange(this, changeset));
      }
    },

    /**
     * Called after a changeset has been rejected.
     *
     * The default implementation emits the "rejected:change" event for the given changeset,
     * if there are any listeners.
     *
     * When overriding, be sure to call the base implementation.
     *
     * @param {!pentaho.type.changes.Changeset} changeset - The set of changes.
     * @param {!Error} reason - The reason why the changes were rejected.
     *
     * @protected
     * @internal
     * @friend {pentaho.type.changes.Transaction}
     */
    _onChangeRejected: function(changeset, reason) {
      if(this._hasListeners("rejected:change")) {
        this._emitSafe(new RejectedChange(this, changeset, reason));
      }
    }
    // endregion
  })
  .implement(EventSource);
});
