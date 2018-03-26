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
  "pentaho/lang/Base",
  "pentaho/lang/ActionResult",
  "pentaho/lang/SortedList",
  "pentaho/util/object",
  "pentaho/util/error"
], function(ChangeRef, TransactionScope, TransactionRejectedError, Base, ActionResult, SortedList, O, error) {

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

      this.__commitLockTaken = false;
      this.__resultWill = null;
      this.__result = null;
      this.__isCurrent = false;

      /**
       * The queue of changesets for the evaluation of the commit will phase.
       *
       * Changesets are inserted in inverse topological order.
       *
       * @type {pentaho.lang.SortedList.<!pentaho.type.changes.Changeset>}
       * @private
       * @see pentaho.type.changes.Transaction#__doCommitWillCore
       */
      this.__commitWillQueue = null;

      /**
       * The set of the owner uids of changesets which are present in the changesets `__commitWillQueue`.
       *
       * @type {Object.<string, boolean>}
       * @private
       */
      this.__commitWillQueueSet = null;

      /**
       * The current changeset being evaluated in the commit will phase.
       *
       * @type {pentaho.type.changes.Changeset}
       * @private
       */
      this.__commitWillChangeset = null;

      /**
       * The set of owner uids of changesets which have ran at least once.
       *
       * @type {Object.<string, boolean>}
       * @private
       */
      this.__commitWillRanSet = null;

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
      var changeRef = O.getOwn(this.__crefByUid, container.$uid, null);
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
     * Tries to acquire the _commit_ lock, throwing if it is already taken.
     *
     * @throws {pentaho.lang.OperationInvalidError} When this method is called while one of
     *  [__commitWill]{@link pentaho.type.changes.Transaction#__commitWill},
     *  [__reject]{@link pentaho.type.changes.Transaction#__reject} or
     *  [__commit]{@link pentaho.type.changes.Transaction#__commit}
     *  is already being called.
     *
     * @private
     */
    __acquireCommitLock: function() {
      this.__assertCommitLockFree();
      this.__commitLockTaken = true;
    },

    /**
     * Asserts that the _commit_ lock is not taken.
     *
     * @throws {pentaho.lang.OperationInvalidError} When this method is called while one of
     * [__commitWill]{@link pentaho.type.changes.Transaction#__commitWill},
     * [__reject]{@link pentaho.type.changes.Transaction#__reject} or
     * [__commit]{@link pentaho.type.changes.Transaction#__commit}
     * is already being called.
     *
     * @private
     */
    __assertCommitLockFree: function() {
      if(this.__commitLockTaken) {
        throw error.operInvalid("Already in the __commit or __commitWill methods.");
      }
    },

    /**
     * Releases a previously acquired _commit_ lock.
     *
     * @private
     */
    __releaseCommitLock: function() {
      this.__commitLockTaken = false;
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

      this.__assertCommitLockFree();

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
        this.__acquireCommitLock();

        result = this.__doCommitWill();

        this.__releaseCommitLock();
      }

      return result;
    },

    /**
     * Performs the commit-will evaluation phase
     * by delegating to `__doCommitWillCore`.
     * Stores the "will" result and marks all changesets as read-only.
     *
     * @return {!pentaho.lang.ActionResult} The commit-will result of the transaction.
     * @private
     */
    __doCommitWill: function() {

      var result = this.__resultWill = this.__doCommitWillCore();

      // Lock changes, whatever the result.
      this.__eachChangeset(function(cset) {
        cset.__setReadOnlyInternal();
      });

      return result;
    },

    /**
     * Actually performs the commit-will evaluation phase,
     * going through `will:change` listeners of the owners of the changesets in this transaction.
     *
     * Evaluation proceeds as follows:
     *
     * 1. Create a queue of changesets, in which changesets are ordered so that leafs are placed beore roots.
     * 2. Add all of the leaf changesets to the queue.
     * 3. If there are no changesets in the queue go to 4.
     *    Otherwise, do:
     * 3.1. Take the first changeset from the queue.
     * 3.2. For each of its will:change listeners, in order, do:
     * 3.2.1. If its transaction version is equal to the current changeset transaction version,
     *        go directly to step 3.3.
     * 3.2.2. Execute the listener.
     * 3.2.3. If a listener cancels the change, exit in error.
     * 3.2.4. Record the changeset transaction version after each listener executes and associate it to it.
     * 3.2.5. If the changeset being processed gets directly modified during the execution of a listener,
     *        restart the execution of its listeners.
     * 3.2.6. If another changeset gets directly modified during the execution of a listener,
     *        and if it is not in the queue, place it in the queue, in its current net order.
     * 3.2.7. If the net order of another changeset gets modified and it is in the queue,
     *        then move it to the new position in the queue, according to the rules:
     *        * If it decreased net order, move it backward in the queue, but staying ahead of others of same order.
     *        * If it increased net order, move it forward in the queue, but staying behind of others of same order.
     * 3.2.8. Go to 3.2.
     * 3.3. Add the changeset's current parent changesets to the queue.
     * 3.4. Go to 3.
     * 4. Exit with success.
     *
     * @return {!pentaho.lang.ActionResult} The commit-will result of the transaction.
     * @private
     */
    __doCommitWillCore: function() {

      if(this.version === 0) {
        // NOOP
        return ActionResult.fulfill();
      }

      if(this.__initCommitWillQueue()) {

        var changesetQueue = this.__commitWillQueue;
        var changesetQueueSet = this.__commitWillQueueSet;

        // @type owner.uid -> [ lastChangesetVersionSeenByListener ]
        var listenersVersionsByUid = Object.create(null);

        var currentChangeset;
        var currentChangesetVersionLocal;
        var currentOwner;
        var currentListenersVersions;
        var isChangesetRestart;

        var keyArgsOnChangeWill = {
          isCanceled: __event_isCanceled,
          interceptor: function(listener, owner, eventArgs, index) {

            // Take care to only allocate `currentListenersVersions` if owner has at least one listener,
            // which is now surely the case...
            if(currentListenersVersions === null) {
              currentListenersVersions =
                listenersVersionsByUid[currentOwner.$uid] || (listenersVersionsByUid[currentOwner.$uid] = []);
            }

            if((currentListenersVersions[index] || 0) < currentChangeset.transactionVersion) {
              try {
                listener.apply(owner, eventArgs);
              } finally {
                if(!eventArgs[0].isCanceled) {
                  // Store for later.
                  currentListenersVersions[index] = currentChangeset.transactionVersion;

                  // If the current changeset was modified, restart its processing.
                  // if(currentChangeset.transactionVersionLocal > currentChangesetVersionLocal) {
                  //
                  //   isChangesetRestart = true;
                  //
                  //   // Break. Don't notify any more listeners.
                  //   eventArgs[0].cancel("changeset restart");
                  //
                  //   // In case an error is being thrown, the error handler is invoked (EventSource#_emitGeneric).
                  //   // The error is not caught here to reuse the default error handler, which console-logs the error.
                  // }
                }
              }
            }
          }
        };

        while((currentChangeset = changesetQueue.shift()) !== undefined) {

          currentOwner = currentChangeset.owner;

          delete changesetQueueSet[currentOwner.$uid];
          this.__commitWillRanSet[currentOwner.$uid] = true;
          this.__commitWillChangeset = currentChangeset;

          currentListenersVersions = null;

          while(true) {
            // Restart processing the changeset if any local changes are performed in it.
            // Changes to other changesets, instead, result in them being added to the queue.
            isChangesetRestart = false;
            currentChangesetVersionLocal = currentChangeset.transactionVersionLocal;

            var cancelReason = currentOwner._onChangeWill(currentChangeset, keyArgsOnChangeWill);

            if(!isChangesetRestart) {
              if(cancelReason != null) {
                this.__finalizeCommitWillQueue();
                return ActionResult.reject(cancelReason);
              }

              break;
            }
          }

          this.__addParentsToCommitWillQueue(currentOwner);
        }
      }

      this.__finalizeCommitWillQueue();
      return ActionResult.fulfill();
    },

    /**
     * Creates the queue data structures that support the commit-will evaluation phase.
     *
     * @return {boolean} `true` if there are any changesets with `will:change` event listeners; `false`, otherwise.
     *
     * @private
     */
    __initCommitWillQueue: function() {

      var transaction = this;

      this.__commitWillQueue = new SortedList({comparer: __compareChangesets});
      this.__commitWillQueueSet = Object.create(null);
      this.__commitWillRanSet = Object.create(null);
      this.__commitWillChangeset = null;

      var anyChangeWillListeners = false;

      this.__csets.forEach(collectLeafChangesetsRecursive);

      return anyChangeWillListeners;

      function collectLeafChangesetsRecursive(changeset) {

        var isParent = false;

        if(!anyChangeWillListeners && changeset.owner._hasListeners("will:change")) {
          anyChangeWillListeners = true;
        }

        changeset.eachChildChangeset(function() {
          isParent = true;
          // Break.
          return false;
        });

        if(!isParent) {
          transaction.__addToCommitWillQueue(changeset);
        }
      }
    },

    /**
     * Releases the queue data structures that support the commit-will evaluation phase.
     * @private
     */
    __finalizeCommitWillQueue: function() {
      this.__commitWillQueue = this.__commitWillQueueSet = this.__commitWillChangeset = this.__commitWillRanSet = null;
    },

    /**
     * Adds the parent changesets of a changeset to the commit-will queue,
     * given the child changeset owner.
     *
     * @param {!pentaho.type.mixins.Container} childOwner - The owner of the child changeset.
     * @private
     */
    __addParentsToCommitWillQueue: function(childOwner) {
      var irefs = this.getAmbientReferences(childOwner);
      if(irefs !== null) {
        var L = irefs.length;
        var i = -1;
        while(++i < L) {
          var parentChangeset = irefs[i].container.__cset;
          if(parentChangeset !== null) {
            this.__addToCommitWillQueue(parentChangeset, /* forceIfRan: */true);
          }
        }
      }
    },

    /**
     * Adds a changeset to the commit-will queue, if it isn't there yet.
     *
     * @param {!pentaho.type.changes.Changeset} changeset - The changeset.
     * @param {boolean} forceIfRan - Indicates that the changeset should be added even if it already ran.
     * @private
     */
    __addToCommitWillQueue: function(changeset, forceIfRan) {
      // Safe to not use O.hasOwn because container uids are numeric strings (cannot be "__proto__").
      var uid = changeset.owner.$uid;
      if(!this.__commitWillQueueSet[uid] && (forceIfRan || !this.__commitWillRanSet[uid])) {

        this.__commitWillQueue.push(changeset);
        this.__commitWillQueueSet[uid] = true;
      }
    },

    /**
     * Called by a changeset when its `transactionVersionLocal` changes.
     *
     * When the commit-will phase is evaluating,
     * this method adds the given changeset to the evaluation queue,
     * if it isn't the current changeset being evaluated.
     *
     * @param {!pentaho.type.changes.Changeset} changeset - The changeset.
     * @private
     */
    __onChangesetLocalVersionChangeDid: function(changeset) {
      if(this.__commitWillChangeset !== changeset && this.__commitWillQueue !== null) {
        this.__addToCommitWillQueue(changeset);
      }
    },

    /**
     * Called by a changeset when its topological order is about to change.
     *
     * @param {!pentaho.type.changes.Changeset} changeset - The changeset.
     *
     * @return {?function} A function that should be called after the change, or `null`.
     *
     * @private
     */
    __onChangesetNetOrderChangeWill: function(changeset) {
      // Remove from the queue if it's there.
      // Leave it in the set though.
      var commitWillQueue = this.__commitWillQueue;
      if(commitWillQueue !== null && this.__commitWillQueueSet[changeset.owner.$uid]) {
        var index = commitWillQueue.search(changeset);
        if(index >= 0) {
          commitWillQueue.splice(index, 1);
          return this.__onChangesetNetOrderChangeDid.bind(this, changeset);
        }
      }

      return null;
    },

    /**
     * Called to finish the topological order change of a changeset.
     *
     * @param {!pentaho.type.changes.Changeset} changeset - The changeset.
     *
     * @private
     */
    __onChangesetNetOrderChangeDid: function(changeset) {
      this.__commitWillQueue.push(changeset);
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

      this.__acquireCommitLock();

      var result = this.__resultWill;
      if(!result) {
        result = this.__doCommitWill();
      }

      if(result.isFulfilled) {
        result = this.__applyChanges();
      }

      this.__releaseCommitLock();

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

      var context = this.context;

      context.__transactionEnterCommitDid(this);

      // Make sure to execute listeners without an active transaction.
      context.enterCommitted().using(this.__eachChangeset.bind(this, mapper));

      context.__transactionExitCommitDid(this);

      return reason;
    }
  });

  function __compareChangesets(csa, csb) {
    return csb._netOrder - csa._netOrder;
  }

  /**
   * Determines if a given event object is canceled.
   *
   * @memberOf pentaho.type.changes.Transaction~
   *
   * @param {!pentaho.lang.Event} event - The event object.
   *
   * @return {boolean} `true` if it is canceled; `false`, otherwise.
   *
   * @private
   */
  function __event_isCanceled(event) {
    return event.isCanceled;
  }
});
