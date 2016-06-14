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
  "./ChangeRef",
  "./TransactionScope",
  "./TransactionRejectedError",
  "../../lang/Base",
  "../../lang/ActionResult",
  "../../lang/UserError",
  "../../util/object",
  "../../util/error"
], function(ChangeRef, TransactionScope, TransactionRejectedError, Base, ActionResult, UserError, O, error) {

  "use strict";

  return Base.extend(/** @lends pentaho.type.changes.Transaction# */{
    /**
     * @alias Transaction
     * @memberOf pentaho.type.changes
     * @class
     * @friend {pentaho.type.Context}
     * @friend {pentaho.type.changes.TransactionScope}
     * @implements pentaho.lang.IDisposable
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
      this._csetByUid = {};
      this._csets = [];

      // Dictionary of ChangeRef by container uid.
      this._crefByUid = {};
      this._crefs = [];

      this._actionLockTaken = false;
      this._resultWill = null;
      this._result = null;
      this._isCurrent = false;

      /**
       * The number of active scopes of this transaction.
       *
       * The transaction can be committed only when it has a single scope.
       *
       * @type {number}
       * @private
       */
      this._scopeCount = 0;
    },

    //region State
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
      return !this._result;
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
      return !!(this._result || this._resultWill);
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
      return this._result;
    },
    //endregion

    //region Changesets and ChangeRefs
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
      return O.getOwn(this._csetByUid, uid) || null;
    },

    /**
     * Gets the `ChangeRef` for the given container, creating one if necessary.
     *
     * @param {pentaho.type.ContainerMixin} container - The container.
     *
     * @return {!pentaho.type.changes.ChangeRef} The corresponding `ChangeRef`.
     *
     * @private
     */
    _ensureChangeRef: function(container) {
      var uid  = container.$uid;
      var cref = O.getOwn(this._crefByUid, uid);
      if(!cref) {
        this._crefByUid[uid] = cref = new ChangeRef(container);
        this._crefs.push(cref);
      }

      return cref;
    },

    /**
     * Gets the `ChangeRef` for a container, given its unique identifier.
     *
     * @param {string} container - The container unique identifier.
     *
     * @return {pentaho.type.changes.ChangeRef} The corresponding `ChangeRef` or `null`.
     * @private
     */
    _getChangeRef: function(uid) {
      return O.getOwn(this._crefByUid, uid) || null;
    },

    /**
     * Called by the changeset constructor to register it with the transaction.
     *
     * @param {!pentaho.type.changes.Changeset} changeset - The changeset.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the transaction has already been previewed,
     * committed or rejected, and thus can no longer be changed.
     *
     * @private
     */
    _addChangeset: function(changeset) {
      if(this.isReadOnly)
        throw error.operInvalid(
            "Transaction cannot change because it has already been previewed, committed or rejected.");

      var owner = changeset.owner;

      this._csetByUid[owner._uid] = changeset;
      this._csets.push(changeset);

      if(this._isCurrent) owner._cset = changeset;
    },

    /**
     * Iterates through all of the changesets.
     *
     * @param {function(this:pentaho.type.changes.Transaction, pentaho.type.changes.Changeset):boolean} fun - The
     * iteratee method.
     *
     * @private
     */
    _eachChangeset: function(fun) {
      var changesets = this._csets;
      var L = changesets.length;
      var i = -1;
      while(++i < L) fun.call(this, changesets[i]);
    },

    // At least initially, the leafs of the graph are those changesets that have local, primitive changes.
    _buildGraph: function() {
      // owner uid : true
      var visitedSet = Object.create(null);

      this._eachChangeset(function(cset) {
        this._exploreContainer(cset.owner, 0, visitedSet);
      }, this);

      // Sort the changesets according to topological order.
      this._csets.sort(compareChangesets);
    },

    _exploreContainer: function(container, netOrder, visitedSet) {
      var cset = container._cset;
      var uid = container._uid;

      // Already been here?
      if(uid in visitedSet) {
        // Yes...

        // Is it a cycle? Is this container already being explored in the stack?
        if(visitedSet[uid]) {
          // This is a loop!
          // 1. We can't explore further.
          // 2. Don't update the net order - it would keep increasing ad infinitum - so keep initial order.
          // 3. Return null, so that _addNestedChangeset below is not called;
          //    this leaves the cycle out of changesets and makes user's lifes' easier.
          return null;
        }

        // This isn't a loop.
        this._updateContainerNetOrder(container, netOrder, visitedSet);
        return cset;
      }

      // 1st time here
      visitedSet[uid] = true;

      if(!cset) cset = container._createChangeset(this);

      cset._updateNetOrder(netOrder);

      // Follow refs
      var refs = container._refs;
      if(refs) refs.forEach(function(aref) {

        var containerRef = this._exploreContainer(aref.container, netOrder + 1, visitedSet);
        if(containerRef)
          // Not a cycle, so hook up the two.
          containerRef._setNestedChangeset(cset, aref.property);

      }, this);

      // Mark as not in path anymore.
      // Keep the fact that we've been there, by not deleting the property.
      visitedSet[uid] = false;

      return cset;
    },

    _updateContainerNetOrder: function(container, netOrder, visitedSet) {
      // 1. Must update the net order of cset to the highest one with which one can get to it, from leafs.
      // 2. If the net order increases, must then propagate the change to its references,
      //    until it does not increase anymore or the graph ends.
      // 3. The fact that it isn't a loop up until now, doesn't mean that, ahead, there isn't a loop...
      // 4. Because we're already been here, surely all paths forward already have changesets.

      var uid = container._uid;
      if(!visitedSet[uid]) {
        visitedSet[uid] = true;

        if(container._cset._updateNetOrder(netOrder)) {
          // Propagate through references...

          var refs = container._refs;
          if(refs) refs.forEach(function(aref) {
            this._updateContainerNetOrder(aref.container, netOrder + 1, visitedSet);
          }, this);
        }

        visitedSet[uid] = false;
      }
    },
    //endregion

    //region Ambient transaction
    /**
     * Gets a value that indicates if this transaction is the
     * [current transaction]{@link pentaho.type.Context#transaction}.
     *
     * @type {boolean}
     */
    get isCurrent() {
      return this._isCurrent;
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
     *
     * @see pentaho.type.changes.AbstractTransactionScope
     */
    _scopeEnter: function() {
      // Validate entry

      if(this._result)
        throw error.operInvalid("The transaction is resolved.");

      // Is this the root scope entering?
      if(!this._scopeCount) {
        // Reentering a txn that was set aside?
        // This txn may now be in concurrency error.
        // a) Check if every owners' version is that which was initially captured in the changeset.

        var csets = this._csets;
        var L = csets.length;
        var i = -1;
        var cset;
        while(++i < L) {
          cset = csets[i];
          if(cset.ownerVersion !== cset.owner.$version)
            throw this._reject(new TransactionRejectedError("Concurrency error."));
        }
      }

      this._scopeCount++;
    },

    /**
     * Called by a scope of this transaction to notify that it is exiting.
     *
     * @private
     *
     * @see pentaho.type.changes.AbstractTransactionScope#_exit
     */
    _scopeExit: function() {
      this._scopeCount--;
    },

    /**
     * Called by the context when this transaction becomes the ambient transaction.
     *
     * @private
     *
     * @see pentaho.type.Context#_setTransaction
     */
    _enteringAmbient: function() {

      this._eachChangeset(function(cset) {
        cset.owner._cset = cset;
      });

      this._isCurrent = true;
    },

    /**
     * Called by the context when this transaction will stop being the ambient transaction.
     *
     * @private
     *
     * @see pentaho.type.Context#_setTransaction
     */
    _exitingAmbient: function() {

      this._isCurrent = false;

      this._eachChangeset(function(cset) {
        cset.owner._cset = null;
      });
    },
    //endregion

    //region Action Lock
    /**
     * Tries to acquire the _action_ lock, throwing if it is already taken.
     *
     * @throws {pentaho.lang.OperationInvalidError} When this method is called while one of
     *  [_commitWill]{@link pentaho.type.changes.Transaction#_commitWill},
     *  [_reject]{@link pentaho.type.changes.Transaction#_reject} or
     *  [_commit]{@link pentaho.type.changes.Transaction#_commit}
     *  is already being called.
     *
     * @private
     */
    _acquireActionLock: function() {
      this._assertActionLockFree();
      this._actionLockTaken = true;
    },

    /**
     * Asserts that the _action lock_ is not taken.
     *
     * @throws {pentaho.lang.OperationInvalidError} When this method is called while one of
     * [_commitWill]{@link pentaho.type.changes.Transaction#_commitWill},
     * [_reject]{@link pentaho.type.changes.Transaction#_reject} or
     * [_commit]{@link pentaho.type.changes.Transaction#_commit}
     * is already being called.
     *
     * @private
     */
    _assertActionLockFree: function() {
      if(this._actionLockTaken) throw error.operInvalid("Already in the _commit or _commitWill methods.");
    },

    /**
     * Releases a previously acquired action lock.
     *
     * @private
     */
    _releaseActionLock: function() {
      this._actionLockTaken = false;
    },
    //endregion

    //region _reject
    /**
     * Rejects the transaction with a given reason and throws an error.
     *
     * @param {string|Error|pentaho.lang.UserError} [reason="canceled"] The reason for rejecting the transaction.
     *
     * @throws {pentaho.lang.OperationInvalidError} When this method is called while one of
     * [_commitWill]{@link pentaho.type.changes.Transaction#_commitWill} or
     * [_commit]{@link pentaho.type.changes.Transaction#_commit} is already being called.
     *
     * @throws {Error} If all else goes well, an error is thrown containing the provided rejection reason.
     *
     * @private
     */
    _reject: function(reason) {

      this._assertActionLockFree();

      throw this._resolve(ActionResult.reject(reason || "Transaction canceled."));
    },
    //endregion

    //region _commitWill
    /**
     * Previews the result of [committing]{@link pentaho.type.changes.Transaction#_commit}
     * the transaction by performing its _will_ phase.
     *
     * Call this method to determine if an operation would be valid when there's
     * no _a priori_ intention of committing it, in case it is valid.
     * If previewing returns a fulfilled result, the transaction can still be committed, if desired.
     * In any case,
     * no more changes can be performed in this transaction after `_commitWill` has been called for the first time.
     *
     * If this method is called after a transaction has been committed or rejected,
     * the [commit result]{@link pentaho.type.changes.Transaction#result} is returned.
     *
     * Any subsequent calls to the method while in the proposed state
     * return the result of the first call.
     * As such, when the `_commit` method is later called,
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
     * [_commit]{@link pentaho.type.changes.Transaction#_commit} still needs to be called.
     *
     * @return {!pentaho.lang.ActionResult} The commit-will or commit result of the transaction.
     *
     * @throws {pentaho.lang.OperationInvalidError} When this method is called while one of
     *  [_commitWill]{@link pentaho.type.changes.Transaction#_commitWill} or
     *  [_commit]{@link pentaho.type.changes.Transaction#_commit} is already being called.
     *
     * @private
     */
    _commitWill: function() {
      // NOTE: the reason why we don't immediately reject the transaction when the _commitWill
      // is rejected is that if in the future we'd want to support making further changes
      // that behavior would be broken...

      var result = this._result || this._resultWill;
      if(!result) {
        this._acquireActionLock();

        result = this._commitWillCore();

        this._releaseActionLock();
      }

      return result;
    },

    _commitWillCore: function() {
      this._buildGraph();

      var result = this._resultWill = this._notifyChangeWill();

      // Lock changes, whatever the result.
      this._eachChangeset(function(cset) {
        cset._setReadOnlyInternal();
      });

      return result;
    },

    _notifyChangeWill: function() {
      var changesets = this._csets;
      var L = changesets.length;
      var i = -1;
      var cset, cancelReason, L1;
      while(true) {
        while(++i < L) {
          cset = changesets[i];
          if((cancelReason = cset.owner._notifyChangeWill(cset)))
            return ActionResult.reject(cancelReason);
        }

        // i === L

        if(L === (L1 = changesets.length)) break;

        // TODO: How to order new changesets?

        // Changesets were added.
        i--;
        // i === L - 1
        L = L1;
      }

      return ActionResult.fulfill();
    },
    //endregion

    //region _commit
    /**
     * Commits the transaction.
     *
     * @throws {pentaho.lang.OperationInvalidError} When this method is called while one of
     * [_commitWill]{@link pentaho.type.changes.Transaction#_commitWill} or
     * [_commit]{@link pentaho.type.changes.Transaction#_commit} is already being called.
     *
     * @throws {Error} When the transaction is rejected.
     */
    _commit: function() {

      this._acquireActionLock();

      var result = this._commitWillCore();
      if(result.isFulfilled)
        result = this._applyChanges();

      this._releaseActionLock();

      this._resolve(result);

      if(result.error) throw result.error;

      return result;
    },

    _applyChanges: function() {
      // Apply all changesets.
      // Includes setting owner versions to the new txn version.
      var version = this.context._takeNextVersion();

      this._crefs.forEach(function(cref) {
        cref.apply();
      });

      this._eachChangeset(function(cset) {
        cset._applyInternal(version);
      });

      return ActionResult.fulfill(version);
    },
    //endregion

    _resolve: function(result) {

      this._result = result;

      // Release any _commitWill result.
      this._resultWill = null;

      // Exit all context scopes, including CommittedScopes, until the isRoot scope.
      // The error thrown below, if rejected, should help prevent executing lines of code that would fail.
      if(this._scopeCount) {
        this._scopeCount = 0;
        this._exitingAmbient();
        this.context._transactionExit();
      }

      // Any new changes arising from notification create new transactions/changesets.
      var reason = result.error;

      //jshint laxbreak:true
      var mapper = reason
          ? function(cset) { cset.owner._notifyChangeRej(cset, reason); }
          : function(cset) { cset.owner._notifyChangeDid(cset); };

      // Make sure to execute listeners without an active transaction.
      this.context.enterCommitted().using(this._eachChangeset.bind(this, mapper));

      return reason;
    }
  });

  function compareChangesets(csa, csb) {
    return csa._netOrder - csb._netOrder;
  }
});
