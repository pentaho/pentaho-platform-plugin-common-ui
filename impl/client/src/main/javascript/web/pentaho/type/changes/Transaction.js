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
  "./ChangeRef",
  "./TransactionScope",
  "./TransactionRejectedError",
  "../../lang/Base",
  "../../lang/ActionResult",
  "../../util/object",
  "../../util/error"
], function(ChangeRef, TransactionScope, TransactionRejectedError, Base, ActionResult, O, error) {

  "use strict";

  return Base.extend(/** @lends pentaho.type.changes.Transaction# */{
    /**
     * @alias Transaction
     * @memberOf pentaho.type.changes
     * @class
     * @friend {pentaho.type.Context}
     * @friend {pentaho.type.changes.TransactionScope}
     * @implements {pentaho.lang.IDisposable}
     *
     * @amd pentaho/type/Transaction
     *
     * @classDesc A `Transaction` object stores information about changes performed to
     * [instances]{@link pentaho.type.Instance}.
     *
     * When a transaction is the **ambient transaction**,
     * it stores the changes performed to **any** instances.
     * All of the changes performed are temporary and no change events are emitted,
     * until the transaction is committed.
     *
     * The ambient transaction is accessible through
     * [this.context.transaction]{@link pentaho.type.Context#transaction}.
     *
     * All of the changes are immediately visible, through any read operations of the modified instances,
     * while the transaction is the ambient transaction.
     *
     * If a transaction ceases to be the ambient transaction,
     * then all of the changes that it captured suddenly become inaccessible.
     *
     * If a transaction is later committed, and is successful, every change becomes permanent.
     * Otherwise, if the transaction is simply disposed of, all the changes it captured are lost.
     *
     * Managing the ambient transaction is best handled implicitly,
     * by delegating to a [TransactionScope]{@link pentaho.type.changes.TransactionScope} object.
     *
     * @constructor
     * @description Creates a `Transaction` for a given context.
     * @param {!pentaho.type.Context} context - The context of the transaction.
     */
    constructor: function(context) {
      if(!context) throw error.argRequired("context");

      /**
       * Gets the associated context.
       *
       * @name pentaho.type.changes.Transaction#context
       * @type {!pentaho.type.Context}
       * @readOnly
       */
      O.setConst(this, "context", context);

      // Dictionary of changesets by container uid.
      this.__csetByUid = {};
      this.__csets = [];

      // Dictionary of ChangeRef by container uid.
      this.__crefByUid = {};
      this.__crefs = [];

      this.__actionLockTaken = false;
      this.__resultWill = null;
      this.__result = null;
      this.__isCurrent = false;

      /**
       * The number of active scopes of this transaction.
       *
       * The transaction can be committed only when it has a single scope.
       *
       * @type {number}
       * @private
       * @internal
       */
      this.__scopeCount = 0;

      /**
       * The version number within the transaction.
       *
       * The number of changes performed within the transaction.
       *
       * @type {number}
       * @private
       * @internal
       */
      this.__version = 0;
    },

    /**
     * Increments the version number and returns the new version number.
     *
     * @return {number} The current version number.
     * @private
     * @internal
     */
    __takeNextVersion: function() {
      return ++this.__version;
    },

    /**
     * Gets the current transaction version.
     *
     * Beware, this version number is not the same as that of {@link pentaho.type.mixins.Container#$version}.
     *
     * Initially, a transaction has version `0`.
     * This number is then incremented per each individual made change.
     * Each change indicates the version it caused the transaction to assume:
     * {@link pentaho.type.changes.Change#transactionVersion}.
     *
     * @type {number}
     * @readOnly
     */
    get version() {
      return this.__version;
    },

    // region State
    /**
     * Gets a value that indicates if the transaction is in a proposed state,
     * that is, it has not been committed or rejected.
     *
     * @type {boolean}
     * @readOnly
     *
     * @see pentaho.type.changes.Transaction#result
     */
    get isProposed() {
      return !this.__result;
    },

    /**
     * Gets a value that indicates if the transaction is in a read-only state.
     *
     * A transaction becomes read-only when it is previewed, committed or rejected.
     *
     * @type {boolean}
     * @readOnly
     */
    get isReadOnly() {
      return !!(this.__result || this.__resultWill);
    },

    /**
     * Gets an action result of the final state of the transaction; or `null`,
     * if the transaction is still in a proposed state.
     *
     * @type {pentaho.lang.ActionResult}
     * @readOnly
     *
     * @see pentaho.type.changes.Transaction#isProposed
     */
    get result() {
      return this.__result;
    },
    // endregion

    // region Changesets and ChangeRefs
    /**
     * Gets the changeset of an instance, given its unique identifier.
     *
     * If no changeset has been added for the specified instance, `null` is returned.
     *
     * @param {string} uid - The unique identifier of the instance.
     *
     * @return {pentaho.type.changes.Changeset} The changeset, or `null`.
     */
    getChangeset: function(uid) {
      return O.getOwn(this.__csetByUid, uid, null);
    },

    /**
     * Gets the `ChangeRef` for the given container, creating one if necessary.
     *
     * @param {pentaho.type.mixins.Container} container - The container.
     *
     * @return {!pentaho.type.changes.ChangeRef} The corresponding `ChangeRef`.
     *
     * @private
     * @internal
     */
    __ensureChangeRef: function(container) {
      var uid = container.$uid;
      var cref = O.getOwn(this.__crefByUid, uid);
      if(!cref) {
        this.__crefByUid[uid] = cref = new ChangeRef(container);
        this.__crefs.push(cref);
      }

      return cref;
    },

    /**
     * Gets the `ChangeRef` for a container, given its unique identifier.
     *
     * @param {string} uid - The container unique identifier.
     *
     * @return {pentaho.type.changes.ChangeRef} The corresponding `ChangeRef` or `null`.
     *
     * @private
     * @internal
     */
    __getChangeRef: function(uid) {
      return O.getOwn(this.__crefByUid, uid, null);
    },

    /**
     * Gets the ambient references of a given container, if any.
     *
     * @param {!pentaho.type.mixins.Container} container - The container.
     * @return {pentaho.type.ReferenceList} The reference list, or `null`.
     */
    getAmbientReferences: function(container) {
      var changeRef = O.getOwn(this.__crefByUid, container.__uid, null);
      return (changeRef && changeRef.projectedReferences) || container.__refs;
    },

    /**
     * Called to obtain a changeset for a given container in this transaction.
     *
     * @param {!pentaho.type.mixins.Container} owner - The changeset owner container.
     *
     * @return {!pentaho.type.changes.Changeset} The existing or created changeset.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the transaction has already been previewed,
     * committed or rejected, and thus can no longer be changed.
     *
     * @see pentaho.type.changes.Changeset#__onChildChangesetCreated
     */
    ensureChangeset: function(owner) {
      return O.getOwn(this.__csetByUid, owner.$uid) || this.__createChangeset(owner);
    },

    /**
     * Creates a changeset for a given container in this transaction.
     *
     * @param {!pentaho.type.mixins.Container} owner - The changeset owner container.
     *
     * @return {!pentaho.type.changes.Changeset} The existing or created changeset.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the transaction has already been previewed,
     * committed or rejected, and thus can no longer be changed.
     *
     * @private
     */
    __createChangeset: function(owner) {

      if(this.isReadOnly) {
        throw error.operInvalid(
          "Transaction cannot change because it has already been previewed, committed or rejected.");
      }

      var changeset = owner._createChangeset(this);

      this.__csetByUid[owner.$uid] = changeset;
      this.__csets.push(changeset);

      if(this.__isCurrent) {
        owner.__cset = changeset;
      }

      // Traverse references and create changesets, connecting them along the way.

      // TODO: Should be being careful not to create changeset cycles when there are reference cycles...

      var irefs = this.getAmbientReferences(owner);
      if(irefs !== null) {
        irefs.forEach(function(iref) {
          // Recursive call, when container changeset does not exist yet.
          this.ensureChangeset(iref.container).__onChildChangesetCreated(changeset, iref.property);
        }, this);
      }

      return changeset;
    },

    /**
     * Iterates through all of the changesets.
     *
     * @param {function(this:pentaho.type.changes.Transaction, pentaho.type.changes.Changeset):boolean} fun - The
     * iteratee method.
     *
     * @private
     */
    __eachChangeset: function(fun) {
      var changesets = this.__csets;
      var L = changesets.length;
      var i = -1;
      while(++i < L) fun.call(this, changesets[i]);
    },

    __sortGraph: function() {
      // 1. Changesets are all created.
      //    Whenever a leaf changeset is created,
      //    all of the changesets accessible through inverse references are created as well,
      //    and their topological order updated.
      //    Also, whenever refs are added and removed by primitive actions.
      // 2. Now, sort the changesets according to inverse topological order (leafs first, roots last).
      this.__csets.sort(__compareChangesets);
    },
    // endregion

    // region Ambient transaction
    /**
     * Gets a value that indicates if this transaction is the
     * [current transaction]{@link pentaho.type.Context#transaction}.
     *
     * @type {boolean}
     */
    get isCurrent() {
      return this.__isCurrent;
    },

    /**
     * Enters the transaction and returns a new transaction scope to control the transaction.
     *
     * @return {!pentaho.type.changes.TransactionScope} The new transaction scope.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the transaction is resolved.
     *
     * @throws {pentaho.type.changes.TransactionRejectedError} When entering the root scope of the transaction
     * and the transaction is automatically rejected due to a concurrency error.
     */
    enter: function() {
      return new TransactionScope(this.context, this);
    },

    /**
     * Called by a scope to let its transaction know the scope is entering.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the transaction is resolved.
     *
     * @throws {pentaho.type.changes.TransactionRejectedError} When the root scope is entering
     * and the transaction is automatically rejected due to a concurrency error.
     *
     * @private
     * @internal
     *
     * @see pentaho.type.changes.AbstractTransactionScope
     */
    __scopeEnter: function() {
      // Validate entry

      if(this.__result)
        throw error.operInvalid("The transaction is resolved.");

      // Is this the root scope entering?
      if(!this.__scopeCount) {
        // Reentering a txn that was set aside?
        // This txn may now be in concurrency error.
        // a) Check if every owners' version is that which was initially captured in the changeset.

        var csets = this.__csets;
        var L = csets.length;
        var i = -1;
        var cset;
        while(++i < L) {
          cset = csets[i];
          if(cset.ownerVersion !== cset.owner.$version)
            throw this.__reject(new TransactionRejectedError("Concurrency error."));
        }
      }

      this.__scopeCount++;
    },

    /**
     * Called by a scope of this transaction to notify that it is exiting.
     *
     * @private
     * @internal
     *
     * @see pentaho.type.changes.AbstractTransactionScope#__exit
     */
    __scopeExit: function() {
      this.__scopeCount--;
    },

    /**
     * Called by the context when this transaction becomes the ambient transaction.
     *
     * @private
     * @internal
     *
     * @see pentaho.type.Context#__setTransaction
     */
    __enteringAmbient: function() {

      this.__eachChangeset(function(cset) {
        cset.owner.__cset = cset;
      });

      this.__isCurrent = true;
    },

    /**
     * Called by the context when this transaction will stop being the ambient transaction.
     *
     * @private
     * @internal
     *
     * @see pentaho.type.Context#__setTransaction
     */
    __exitingAmbient: function() {

      this.__isCurrent = false;

      this.__eachChangeset(function(cset) {
        cset.owner.__cset = null;
      });
    },
    // endregion

    // region Action Lock
    /**
     * Tries to acquire the _action_ lock, throwing if it is already taken.
     *
     * @throws {pentaho.lang.OperationInvalidError} When this method is called while one of
     *  [__commitWill]{@link pentaho.type.changes.Transaction#__commitWill},
     *  [__reject]{@link pentaho.type.changes.Transaction#__reject} or
     *  [__commit]{@link pentaho.type.changes.Transaction#__commit}
     *  is already being called.
     *
     * @private
     */
    __acquireActionLock: function() {
      this.__assertActionLockFree();
      this.__actionLockTaken = true;
    },

    /**
     * Asserts that the _action lock_ is not taken.
     *
     * @throws {pentaho.lang.OperationInvalidError} When this method is called while one of
     * [__commitWill]{@link pentaho.type.changes.Transaction#__commitWill},
     * [__reject]{@link pentaho.type.changes.Transaction#__reject} or
     * [__commit]{@link pentaho.type.changes.Transaction#__commit}
     * is already being called.
     *
     * @private
     */
    __assertActionLockFree: function() {
      if(this.__actionLockTaken) throw error.operInvalid("Already in the __commit or __commitWill methods.");
    },

    /**
     * Releases a previously acquired action lock.
     *
     * @private
     */
    __releaseActionLock: function() {
      this.__actionLockTaken = false;
    },
    // endregion

    // region __reject
    /**
     * Rejects the transaction with a given reason and throws an error.
     *
     * @param {string|Error|pentaho.lang.UserError} [reason="canceled"] The reason for rejecting the transaction.
     *
     * @throws {pentaho.lang.OperationInvalidError} When this method is called while one of
     * [__commitWill]{@link pentaho.type.changes.Transaction#__commitWill} or
     * [__commit]{@link pentaho.type.changes.Transaction#__commit} is already being called.
     *
     * @throws {Error} If all else goes well, an error is thrown containing the provided rejection reason.
     *
     * @private
     * @internal
     */
    __reject: function(reason) {

      this.__assertActionLockFree();

      throw this.__resolve(ActionResult.reject(reason || "Transaction canceled."));
    },
    // endregion

    // region __commitWill
    /**
     * Previews the result of [committing]{@link pentaho.type.changes.Transaction#__commit}
     * the transaction by performing its _will_ phase.
     *
     * Call this method to determine if an operation would be valid when there's
     * no _a priori_ intention of committing it, in case it is valid.
     * If previewing returns a fulfilled result, the transaction can still be committed, if desired.
     * In any case,
     * no more changes can be performed in this transaction after `__commitWill` has been called for the first time.
     *
     * If this method is called after a transaction has been committed or rejected,
     * the [commit result]{@link pentaho.type.changes.Transaction#result} is returned.
     *
     * Any subsequent calls to the method while in the proposed state
     * return the result of the first call.
     * As such, when the `__commit` method is later called,
     * it will reuse the result of the anticipated _will_ phase.
     *
     * For each changeset that was registered with the transaction,
     * and that really has changes,
     * its owner is called to emit the `will:change` event, for any registered listeners.
     *
     * Listeners may modify the changeset or any of the changesets contained in the transaction.
     * Also, new changesets can be added to the transaction.
     *
     * If a `will:change` listener cancels one of the changesets,
     * no more listeners are notified and the rejected result is returned.
     * To notify listeners of the rejection,
     * [__commit]{@link pentaho.type.changes.Transaction#__commit} still needs to be called.
     *
     * @return {!pentaho.lang.ActionResult} The commit-will or commit result of the transaction.
     *
     * @throws {pentaho.lang.OperationInvalidError} When this method is called while one of
     *  [__commitWill]{@link pentaho.type.changes.Transaction#__commitWill} or
     *  [__commit]{@link pentaho.type.changes.Transaction#__commit} is already being called.
     *
     * @private
     * @internal
     */
    __commitWill: function() {
      // NOTE: the reason why we don't immediately reject the transaction when the __commitWill
      // is rejected is that if in the future we'd want to support making further changes
      // that behavior would be broken...

      var result = this.__result || this.__resultWill;
      if(!result) {
        this.__acquireActionLock();

        result = this.__commitWillCore();

        this.__releaseActionLock();
      }

      return result;
    },

    // @private
    __commitWillCore: function() {
      this.__sortGraph();

      var result = this.__resultWill = this.__notifyChangeWill();

      // Lock changes, whatever the result.
      this.__eachChangeset(function(cset) {
        cset.__setReadOnlyInternal();
      });

      return result;
    },

    // @private
    __notifyChangeWill: function() {
      var changesets = this.__csets;
      var L = changesets.length;
      var i = -1;
      var cset;
      var cancelReason;
      var L1;
      while(true) {
        while(++i < L) {
          cset = changesets[i];
          if((cancelReason = cset.owner._onChangeWill(cset)))
            return ActionResult.reject(cancelReason);
        }

        // i === L

        if(L === (L1 = changesets.length)) break;

        // TODO: How to order new changesets?
        // Re-run all changesets that, after net sorting, are placed after an added one?
        // What about modifications to existing changesets?
        // Start with leaf changesets.
        // After processing a changeset,
        // place its iref's changesets at the end of the queue.
        // Every changeset which is modified is put back in the queue.

        // Changesets were added.
        // Run the will listeners of the owners of the added changesets.
        i--;
        // i === L - 1
        L = L1;
      }

      return ActionResult.fulfill();
    },
    // endregion

    // region __commit
    /**
     * Commits the transaction.
     *
     * @return {!pentaho.lang.ActionResult} The commit result of the transaction.
     *
     * @throws {pentaho.lang.OperationInvalidError} When this method is called while one of
     * [__commitWill]{@link pentaho.type.changes.Transaction#__commitWill} or
     * [__commit]{@link pentaho.type.changes.Transaction#__commit} is already being called.
     *
     * @throws {Error} When the transaction is rejected.
     *
     * @private
     * @internal
     */
    __commit: function() {

      this.__acquireActionLock();

      var result = this.__commitWillCore();
      if(result.isFulfilled)
        result = this.__applyChanges();

      this.__releaseActionLock();

      this.__resolve(result);

      if(result.error) throw result.error;

      return result;
    },

    // @private
    __applyChanges: function() {
      // Apply all changesets.
      // Includes setting owner versions to the new txn version.
      var version = this.context.__takeNextVersion();

      this.__crefs.forEach(function(cref) {
        cref.apply();
      });

      this.__eachChangeset(function(cset) {
        cset._applyInternal(version);
      });

      return ActionResult.fulfill(version);
    },
    // endregion

    // @private
    __resolve: function(result) {

      this.__result = result;

      // Release any __commitWill result.
      this.__resultWill = null;

      // Exit all context scopes, including CommittedScopes, until the isRoot scope.
      // The error thrown below, if rejected, should help prevent executing lines of code that would fail.
      if(this.__scopeCount) {
        this.__scopeCount = 0;
        this.__exitingAmbient();
        this.context.__transactionExit();
      }

      // Any new changes arising from notification create new transactions/changesets.
      var reason = result.error;

      // jshint laxbreak:true
      var mapper = reason
        ? function(cset) { cset.owner._onChangeRejected(cset, reason); }
        : function(cset) { cset.owner._onChangeDid(cset); };

      // Make sure to execute listeners without an active transaction.
      this.context.enterCommitted().using(this.__eachChangeset.bind(this, mapper));

      return reason;
    }
  });

  function __compareChangesets(csa, csb) {
    return csb._netOrder - csa._netOrder;
  }
});
