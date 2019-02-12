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
  "pentaho/action/Execution",
  "pentaho/action/States",
  "../action/_transactionControl",
  "./ChangeRef",
  "./TransactionScope",
  "./CommittedScope",
  "./TransactionRejectedError",
  "pentaho/lang/SortedList",
  "pentaho/util/object",
  "pentaho/util/error"
], function(module, ActionExecution, States, transactionControl, ChangeRef, TransactionScope, CommittedScope,
            TransactionRejectedError, SortedList, O, error) {

  "use strict";

  /**
   * The stack of transactions performing the `change:finally` phase of a change action.
   *
   * @type {Array.<pentaho.type.action.Transaction>}
   * @readOnly
   */
  var __txnInCommitFinally = [];

  /**
   * The version of the next committed/fulfilled transaction.
   *
   * @type {number}
   * @default 1
   */
  var __nextVersion = 1;

  var Transaction = ActionExecution.extend(module.id, /** @lends pentaho.type.action.Transaction# */{

    /**
     * @alias Transaction
     * @memberOf pentaho.type.action
     * @class
     * @extends pentaho.action.Execution
     * @implements {pentaho.lang.IDisposable}
     * @friend {pentaho.type.action.TransactionScope}
     *
     * @amd pentaho/type/action/Transaction
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
     * [Transaction.current]{@link pentaho.type.action.Transaction#current}.
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
     * by delegating to a [TransactionScope]{@link pentaho.type.action.TransactionScope} object.
     *
     * @constructor
     * @description Creates a `Transaction`.
     */
    constructor: function() {

      this.base();

      // Dictionary of changesets by container uid.
      this.__csetByUid = {};
      this.__csets = [];

      // Dictionary of ChangeRef by container uid.
      this.__crefByUid = {};
      this.__crefs = [];

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

      /**
       * The queue of changesets for the evaluation of the commit init phase.
       *
       * Changesets are inserted in inverse topological order.
       *
       * @type {pentaho.lang.SortedList.<pentaho.type.action.Changeset>}
       * @private
       * @see pentaho.type.action.Transaction#_onPhaseInit
       */
      this.__commitInitQueue = null;

      /**
       * The set of target uids of changesets which are present in the changesets of `__commitInitQueue`..
       *
       * @type {?Object.<string, boolean>}
       * @private
       */
      this.__commitInitQueueSet = null;

      /**
       * The current changeset being evaluated in the commit init phase.
       *
       * @type {pentaho.type.action.Changeset}
       * @private
       */
      this.__commitInitChangeset = null;

      /**
       * The set of target uids of changesets which have ran at least once.
       *
       * @type {?Object.<string, boolean>}
       * @private
       */
      this.__commitInitRanSet = null;

      /**
       * The current changeset action.
       *
       * @type {?pentaho.type.action.Changeset}
       * @private
       */
      this.__action = null;
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
     * {@link pentaho.type.action.Change#transactionVersion}.
     *
     * @type {number}
     * @readOnly
     */
    get version() {
      return this.__version;
    },

    // region State
    /**
     * Gets a value that indicates if the transaction is in a read-only state.
     *
     * A transaction becomes read-only when it is previewed, committed or rejected.
     *
     * @type {boolean}
     * @readOnly
     */
    get isReadOnly() {
      return this.state > States.init;
    },
    // endregion

    // region ActionExecution fields
    /** @inheritDoc */
    get action() {
      var action = this.__action;
      if(action === null) {
        throw error.operInvalid("Action is not set.");
      }

      return action;
    },

    /** @inheritDoc */
    get isSync() {
      return true;
    },

    /**
     * Gets the target of the action execution.
     *
     * @type {pentaho.type.mixins.Container}
     * @readonly
     * @override
     */
    get target() {
      return this.action.target;
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
     * @return {pentaho.type.action.Changeset} The changeset, or `null`.
     */
    getChangeset: function(uid) {
      return O.getOwn(this.__csetByUid, uid, null);
    },

    /**
     * Gets the `ChangeRef` for the given container, creating one if necessary.
     *
     * @param {pentaho.type.mixins.Container} container - The container.
     *
     * @return {pentaho.type.action.ChangeRef} The corresponding `ChangeRef`.
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
     * @return {pentaho.type.action.ChangeRef} The corresponding `ChangeRef` or `null`.
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
     * @param {pentaho.type.mixins.Container} container - The container.
     * @return {pentaho.type.ReferenceList} The reference list, or `null`.
     */
    getAmbientReferences: function(container) {
      var changeRef = O.getOwn(this.__crefByUid, container.$uid, null);
      return (changeRef && changeRef.projectedReferences) || container.__refs;
    },

    /**
     * Called to obtain a changeset for a given container in this transaction.
     *
     * @param {pentaho.type.mixins.Container} target - The changeset target container.
     *
     * @return {pentaho.type.action.Changeset} The existing or created changeset.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the transaction has already been previewed,
     * committed or rejected, and thus can no longer be changed.
     *
     * @see pentaho.type.action.Changeset#__onChildChangesetCreated
     */
    ensureChangeset: function(target) {
      return O.getOwn(this.__csetByUid, target.$uid) || this.__createChangeset(target);
    },

    /**
     * Creates a changeset for a given container in this transaction.
     *
     * @param {pentaho.type.mixins.Container} target - The changeset target container.
     *
     * @return {pentaho.type.action.Changeset} The existing or created changeset.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the transaction has already been previewed,
     * committed or rejected, and thus can no longer be changed.
     *
     * @private
     */
    __createChangeset: function(target) {

      if(this.isReadOnly) {
        throw error.operInvalid(
          "Transaction cannot change because it has already been previewed, committed or rejected.");
      }

      var changeset = target._createChangeset(this);

      this.__csetByUid[target.$uid] = changeset;
      this.__csets.push(changeset);

      if(this.__isCurrent) {
        target.__cset = changeset;
      }

      // Traverse references and create changesets, connecting them along the way.

      // TODO: Should be being careful not to create changeset cycles when there are reference cycles...

      var irefs = this.getAmbientReferences(target);
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
     * @param {function(this:pentaho.type.action.Transaction, pentaho.type.action.Changeset):boolean} fun - The
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
     * [current transaction]{@link pentaho.type.action.Transaction#current}.
     *
     * @type {boolean}
     */
    get isCurrent() {
      return this.__isCurrent;
    },

    /**
     * Enters the transaction and returns a new transaction scope to control the transaction.
     *
     * @return {pentaho.type.action.TransactionScope} The new transaction scope.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the transaction is resolved.
     *
     * @throws {pentaho.type.action.TransactionRejectedError} When entering the root scope of the transaction
     * and the transaction is automatically rejected due to a concurrency error.
     */
    enter: function() {
      return new TransactionScope(this);
    },

    /**
     * Called by a scope to let its transaction know the scope is entering.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the transaction is resolved.
     *
     * @throws {pentaho.type.action.TransactionRejectedError} When the root scope is entering
     * and the transaction is automatically rejected due to a concurrency error.
     *
     * @private
     * @internal
     *
     * @see pentaho.type.action.AbstractTransactionScope
     */
    __scopeEnter: function() {
      // Validate entry

      if(this.isSettled) {
        throw error.operInvalid("The transaction is resolved.");
      }

      // Is this the root scope entering?
      if(!this.__scopeCount) {
        // Reentering a txn that was set aside?
        // This txn may now be in concurrency error.
        // a) Check if every targets' version is that which was initially captured in the changeset.

        var csets = this.__csets;
        var L = csets.length;
        var i = -1;
        var cset;
        while(++i < L) {
          cset = csets[i];
          if(cset.targetVersion !== cset.target.$version) {
            this.reject(new TransactionRejectedError("Concurrency error."));
            throw this.error;
          }
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
     * @see pentaho.type.action.AbstractTransactionScope#__exit
     */
    __scopeExit: function() {
      this.__scopeCount--;
    },

    /**
     * Called when this transaction becomes the ambient transaction.
     *
     * @private
     * @internal
     *
     * @see pentaho.type.action.Transaction#__setCurrent
     */
    __enteringAmbient: function() {

      this.__eachChangeset(function(cset) {
        cset.target.__cset = cset;
      });

      this.__isCurrent = true;
    },

    /**
     * Called when this transaction will stop being the ambient transaction.
     *
     * @private
     * @internal
     *
     * @see pentaho.type.action.Transaction#__setCurrent
     */
    __exitingAmbient: function() {

      this.__isCurrent = false;

      this.__eachChangeset(function(cset) {
        cset.target.__cset = null;
      });
    },
    // endregion

    // region Phase INIT
    /*
     * Performs the init evaluation phase,
     * going through `change:init` listeners of the targets of the changesets in this transaction.
     *
     * Evaluation proceeds as follows:
     *
     * 1. Create a queue of changesets, in which changesets are ordered so that leafs are placed before roots.
     * 2. Add all of the leaf changesets to the queue.
     * 3. If there are no changesets in the queue go to 4.
     *    Otherwise, do:
     * 3.1. Take the first changeset from the queue.
     * 3.2. For each of its change:init listeners, in order, do:
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
     */

    /** @inheritDoc */
    _onPhaseInit: function() {

      if(this.version === 0) {
        return;
      }

      if(this.__setupCommitInitQueue()) {

        var changesetQueue = this.__commitInitQueue;
        var changesetQueueSet = this.__commitInitQueueSet;

        // @type target.uid -> [ lastChangesetVersionSeenByListener ]
        var listenersVersionsByUid = Object.create(null);

        var currentChangeset;
        var currentTarget;
        var currentListenersVersions;
        var txn = this;
        var keyArgsOnChangeInit = {
          isCanceled: __actionExecution_isCanceled,
          interceptor: function(listener, target, eventArgs, index) {

            // Take care to only allocate `currentListenersVersions` if target has at least one listener,
            // which is now surely the case...
            if(currentListenersVersions === null) {
              currentListenersVersions =
                listenersVersionsByUid[currentTarget.$uid] || (listenersVersionsByUid[currentTarget.$uid] = []);
            }

            if((currentListenersVersions[index] || 0) < currentChangeset.transactionVersion) {
              try {
                listener.apply(target, eventArgs);
              } finally {
                if(!txn.isRejected) {
                  // Store for later.
                  currentListenersVersions[index] = currentChangeset.transactionVersion;
                }
              }
            }
          }
        };

        while((currentChangeset = changesetQueue.shift()) !== undefined) {

          this.__action = currentChangeset;
          currentTarget = currentChangeset.target;

          delete changesetQueueSet[currentTarget.$uid];
          this.__commitInitRanSet[currentTarget.$uid] = true;
          this.__commitInitChangeset = currentChangeset;

          currentListenersVersions = null;

          currentTarget._onChangeInit(this, keyArgsOnChangeInit);

          if(this.isRejected) {
            this.__finalizeCommitInitQueue();
            return;
          }

          this.__addParentsToCommitInitQueue(currentTarget);
        }
      }

      this.__finalizeCommitInitQueue();
    },

    /**
     * Creates the queue data structures that support the commit-init evaluation phase.
     *
     * @return {boolean} `true` if there are any changesets with `change:init` event listeners; `false`, otherwise.
     *
     * @private
     */
    __setupCommitInitQueue: function() {

      var me = this;

      this.__commitInitQueue = new SortedList({comparer: __compareChangesets});
      this.__commitInitQueueSet = Object.create(null);
      this.__commitInitRanSet = Object.create(null);
      this.__commitInitChangeset = null;

      var anyChangeInitListeners = false;

      this.__csets.forEach(function collectLeafChangesetsRecursive(changeset) {

        var isParent = false;

        if(!anyChangeInitListeners && changeset.target._hasListeners("change", "init")) {
          anyChangeInitListeners = true;
        }

        changeset.eachChildChangeset(function() {
          isParent = true;
          // Break.
          return false;
        });

        if(!isParent) {
          me.__addToCommitInitQueue(changeset);
        }
      });

      return anyChangeInitListeners;
    },

    /**
     * Releases the queue data structures that support the commit-init evaluation phase.
     * @private
     */
    __finalizeCommitInitQueue: function() {
      this.__commitInitQueue = this.__commitInitQueueSet = this.__commitInitChangeset = this.__commitInitRanSet = null;
      this.__action = null;
    },

    /**
     * Adds the parent changesets of a changeset to the commit-init queue,
     * given the child changeset target.
     *
     * @param {pentaho.type.mixins.Container} childTarget - The target of the child changeset.
     * @private
     */
    __addParentsToCommitInitQueue: function(childTarget) {
      var irefs = this.getAmbientReferences(childTarget);
      if(irefs !== null) {
        var L = irefs.length;
        var i = -1;
        while(++i < L) {
          var parentChangeset = irefs[i].container.__cset;
          if(parentChangeset !== null) {
            this.__addToCommitInitQueue(parentChangeset, /* forceIfRan: */true);
          }
        }
      }
    },

    /**
     * Adds a changeset to the commit-will queue, if it isn't there yet.
     *
     * @param {pentaho.type.action.Changeset} changeset - The changeset.
     * @param {boolean} forceIfRan - Indicates that the changeset should be added even if it already ran.
     * @private
     */
    __addToCommitInitQueue: function(changeset, forceIfRan) {
      // Safe to not use O.hasOwn because container uids are numeric strings (cannot be "__proto__").
      var uid = changeset.target.$uid;
      if(!this.__commitInitQueueSet[uid] && (forceIfRan || !this.__commitInitRanSet[uid])) {

        this.__commitInitQueue.push(changeset);
        this.__commitInitQueueSet[uid] = true;
      }
    },

    /**
     * Called by a changeset when its `transactionVersionLocal` changes.
     *
     * When the commit-will phase is evaluating,
     * this method adds the given changeset to the evaluation queue,
     * if it isn't the current changeset being evaluated.
     *
     * @param {pentaho.type.action.Changeset} changeset - The changeset.
     * @private
     */
    __onChangesetLocalVersionChangeDid: function(changeset) {
      if(this.__commitInitChangeset !== changeset && this.__commitInitQueue !== null) {
        this.__addToCommitInitQueue(changeset);
      }
    },

    /**
     * Called by a changeset when its topological order is about to change.
     *
     * @param {pentaho.type.action.Changeset} changeset - The changeset.
     *
     * @return {?function} A function that should be called after the change, or `null`.
     *
     * @private
     */
    __onChangesetNetOrderChangeWill: function(changeset) {
      // Remove from the queue if it's there.
      // Leave it in the set though.
      var commitInitQueue = this.__commitInitQueue;
      if(commitInitQueue !== null && this.__commitInitQueueSet[changeset.target.$uid]) {
        var index = commitInitQueue.search(changeset);
        if(index >= 0) {
          commitInitQueue.splice(index, 1);
          return this.__onChangesetNetOrderChangeDid.bind(this, changeset);
        }
      }

      return null;
    },

    /**
     * Called to finish the topological order change of a changeset.
     *
     * @param {pentaho.type.action.Changeset} changeset - The changeset.
     *
     * @private
     */
    __onChangesetNetOrderChangeDid: function(changeset) {
      this.__commitInitQueue.push(changeset);
    },
    // endregion

    // region Phase WILL
    /** @inheritDoc */
    _validate: function() {

      var changesets = this.__csets;
      var L = changesets.length;
      var i = -1;
      while(++i < L) {

        this.__action = changesets[i];

        var errors = this.base();
        if(errors != null) {
          this.__action = null;
          return errors;
        }
      }

      this.__action = null;
    },

    /** @inheritDoc */
    _lockAction: function() {
      var changesets = this.__csets;
      var L = changesets.length;
      var i = -1;
      while(++i < L) {
        changesets[i].__setReadOnlyInternal();
      }
    },

    /** @inheritDoc */
    _onPhaseWill: function() {

      var changesets = this.__csets;
      var L = changesets.length;
      var i = -1;
      while(++i < L) {

        this.__action = changesets[i];

        this.target._onChangeWill(this);

        if(this.isRejected) {
          break;
        }
      }

      this.__action = null;
    },
    // endregion

    /** @inheritDoc */
    _onPhaseDo: function() {
      // Apply all changesets.
      // Includes setting target versions to the new txn version.
      var version = __takeNextVersion();

      // .. Apply change refs.
      this.__crefs.forEach(function(cref) {
        cref.apply();
      });

      // .. Apply change sets.
      this.__eachChangeset(function(cset) {
        cset._applyInternal(version);
      });
    },

    /** @inheritDoc */
    _onPhaseFinally: function() {

      // Exit all scopes, including CommittedScopes, until the isRoot scope.
      // The error thrown below, if rejected, should help prevent executing lines of code that would fail.
      if(this.__scopeCount) {
        this.__scopeCount = 0;
        this.__exitingAmbient();
        transactionControl.exitCurrent();
      }

      __txnInCommitFinally.push(this);

      // Make sure to execute listeners without an active transaction.
      var txn = this;

      Transaction.enterCommitted().using(function() {

        txn.__eachChangeset(function(changeset) {

          txn.__action = changeset;

          txn.target._onChangeFinally(txn);
        });
      });

      this.__action = null;

      var txnOther = __txnInCommitFinally.pop();
      if(txnOther !== this) {
        throw error.operInvalid("Unbalanced transaction exit commit finally.");
      }
    }
  }, /** @lends pentaho.type.action.Transaction */{

    /**
     * Gets the ambient transaction, if any, or `null`.
     *
     * @type {pentaho.type.action.Transaction}
     * @readOnly
     */
    get current() {
      return transactionControl.current;
    },

    /**
     * Enters a scope of change.
     *
     * To mark the changes in the scope as error,
     * call its [reject]{@link pentaho.type.action.TransactionScope#reject} method.
     *
     * To end the scope of change successfully,
     * dispose the returned transaction scope,
     * by calling its [dispose]{@link pentaho.type.action.TransactionScope#scope} method.
     *
     * If the scope initiated a transaction,
     * then that transaction is committed.
     * Otherwise,
     * if an ambient transaction already existed when the change scope was created,
     * that transaction is left uncommitted.
     *
     * To end the scope with an error,
     * call its [reject]{@link pentaho.type.action.TransactionScope#reject} method.
     *
     * @return {pentaho.type.action.TransactionScope} The new transaction scope.
     */
    enter: function() {
      var txn = transactionControl.current || new Transaction(); // <=> new this() :-)
      return txn.enter();
    },

    /**
     * Enters a read-committed scope.
     *
     * Within this scope there is no current transaction and
     * reading the properties of instances obtains their committed values.
     *
     * @return {pentaho.type.action.CommittedScope} The read-committed scope.
     */
    enterCommitted: function() {
      return new CommittedScope();
    },

    /**
     * Gets any changesets still being delivered through notifications in the commit phase
     * of transactions.
     *
     * If a transaction is started and committed from within the `change:finally` listener of another,
     * then multiple changesets may be returned.
     *
     * @param {pentaho.type.mixins.Container} container - The container.
     *
     * @return {Array.<pentaho.type.action.Changeset>} An array of changesets, if any changeset exists;
     * `null` otherwise.
     */
    getChangesetsPending: function(container) {
      var changesets = null;
      var L = __txnInCommitFinally.length;
      if(L > 0) {
        var i = -1;
        var uid = container.$uid;
        while(++i < L) {
          var transaction = __txnInCommitFinally[i];
          var changeset = transaction.getChangeset(uid);
          if(changeset !== null) {
            (changesets || (changesets = [])).push(changeset);
          }
        }
      }

      return changesets;
    }
  });

  return Transaction;

  /**
   * Compares two changesets according to net order.
   *
   * @param {pentaho.type.action.Changeset} csa - The first changeset.
   * @param {pentaho.type.action.Changeset} csb - The second changeset.
   *
   * @return {number} A comparison result.
   */
  function __compareChangesets(csa, csb) {
    return csb._netOrder - csa._netOrder;
  }

  /**
   * Increments and returns the next version number for use in the
   * [commit]{@link pentaho.type.action.Transaction#execute} of a transaction.
   *
   * @memberOf pentaho.type.action.Transaction~
   * @private
   *
   * @return {number} The next version number.
   */
  function __takeNextVersion() {
    return ++__nextVersion;
  }

  /**
   * Determines if a given action execution is canceled.
   *
   * @param {pentaho.type.action.Transaction} actionExecution - The action execution.
   * @return {boolean} `true` if it is canceled; `false`, otherwise.
   */
  function __actionExecution_isCanceled(actionExecution) {
    return actionExecution.isCanceled;
  }
});
