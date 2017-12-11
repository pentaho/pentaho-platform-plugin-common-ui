/*!
 * Copyright 2010 - 2017 Hitachi Vantara. All rights reserved.
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
  "pentaho/lang/Base",
  "./States",
  "pentaho/lang/ArgumentRequiredError",
  "pentaho/lang/ArgumentInvalidTypeError",
  "pentaho/lang/OperationInvalidError",
  "pentaho/lang/UserError",
  "pentaho/lang/RuntimeError",
  "pentaho/debug",
  "pentaho/debug/Levels",
  "pentaho/util/logger"
],
function(module, Base, States,
         ArgumentRequiredError, ArgumentInvalidTypeError, OperationInvalidError,
         UserError, RuntimeError,
         debugMgr, DebugLevels, logger) {

  "use strict";

  /* eslint dot-notation: 0 */
  /* globals Promise */

  var MSG_STATE_EXECUTION_START = "The `execute` method can only be called while in the 'unstarted' state.";
  var MSG_STATE_DONE = "The `done` method can only be called while in the 'do' state.";
  var MSG_STATE_REJECT = "The `reject` method can only be called while in the 'init', 'will' or 'do' states.";

  /** @type pentaho.type.action.States */
  var executingUnsettledStates = States.init | States.will | States["do"];

  /** @type pentaho.type.action.States */
  var rejectedStates = States.canceled | States.failed;

  /** @type pentaho.type.action.States */
  var settledStates = States.did | rejectedStates;

  return Base.extend(/** @lends pentaho.type.action.Execution# */{
    /**
     * @alias Execution
     * @memberOf pentaho.type.action
     * @class
     * @extends pentaho.lang.Base
     * @abstract
     *
     * @amd pentaho/type/action/Execution
     *
     * @classDesc The `action.Execution` class represents a certain model of action execution.
     *
     * This class manages the execution of an action and
     * enforces the multiple phases by which all actions, generically,
     * go through, which are: "init", "will", "do", and "finally".
     *
     * ##### Synchronous or Asynchronous
     *
     * The associated action can be synchronous or asynchronous, as determined by the type property,
     * {@link pentaho.type.action.Base.Type#isSync}.
     * The execution of a synchronous action is completed synchronously.
     * while that of an asynchronous action only completes asynchronously,
     * due to its asynchronous "do" phase.
     *
     * The [execute]{@link pentaho.type.action.Execution#execute} method handles
     * the execution of both types of actions.
     * When the associated action is [asynchronous]{@link pentaho.type.action.Base.Type#isSync}, or
     * it is not know if it is synchronous or asynchronous,
     * after calling `execute`,
     * obtain the value of the [promise]{@link pentaho.type.action.Execution#promise} property
     * and wait for its resolution.
     *
     * ##### Execution model
     *
     * The following is a detailed description of the action execution model:
     *
     * 1. When an action execution is constructed,
     *    it is in the [unstarted]{@link pentaho.type.action.States.unstarted} state.
     *
     *    The action's
     *    [label]{@link pentaho.type.action.Base#label} and
     *    [description]{@link pentaho.type.action.Base#description} properties,
     *    and any other property which defines what it ultimately does,
     *    can still be freely modified.
     *
     *    In this state,
     *    the execution cannot be
     *    settled by marking it
     *    [done]{@link pentaho.type.action.Execution#done} or
     *    [rejected]{@link pentaho.type.action.Execution#reject}.
     *
     * 2. When the [execute]{@link pentaho.type.action.Execution#execute} method is called,
     *    the execution enters the **init** phase:
     *    -  the state is set to [init]{@link pentaho.type.action.States.init};
     *    -  the [_onPhaseInit]{@link pentaho.type.action.Execution#_onPhaseInit} method is called.
     *
     *    The action's
     *    [label]{@link pentaho.type.action.Base#label} and
     *    [description]{@link pentaho.type.action.Base#description} properties,
     *    and any other property which defines what it ultimately does,
     *    can be freely modified at this stage.
     *
     *    The execution can be settled by marking it [rejected]{@link pentaho.type.action.Execution#reject}
     *    in which case it transits to the _finally_ phase.
     *
     *    Otherwise,
     *    if the associated action is not [valid]{@link pentaho.type.action.Base#validate},
     *    the execution is automatically rejected with the first reported validation error.
     *
     *    Otherwise,
     *    the execution automatically transits to the _will_ phase.
     *
     * 3. In the **will** phase,
     *    what the associated action will do is already determined and cannot change anymore:
     *    - the state is set to [will]{@link pentaho.type.action.States.will};
     *    - the associated action is frozen, using {@link Object.freeze},
     *      and should **not** be modified anymore (e.g. by modifying nested objects);
     *      trying to modify direct properties of the action will throw a {@link TypeError};
     *    - the [_onPhaseWill]{@link pentaho.type.action.Execution#_onPhaseWill} method is called.
     *
     *    From this point on, an execution can be canceled based on what exactly
     *    the associated action will do.
     *
     *    The execution can be settled by marking it [rejected]{@link pentaho.type.action.Execution#reject},
     *    in which case it transits to the _finally_ phase.
     *
     *    Otherwise, the execution automatically transits to the _do_ phase.
     *
     * 4. In the **do** phase, the execution, proper, is carried out:
     *    - the state is set to [do]{@link pentaho.type.action.States.do};
     *    - the [_onPhaseDo]{@link pentaho.type.action.Execution#_onPhaseDo} method is called.
     *    - if after calling `_onPhaseDo`, the execution is not yet done or rejected,
     *      the [_doDefault]{@link pentaho.type.action.Execution#_doDefault} method is called,
     *      allowing the action execution class to clearly handle a default behaviour.
     *
     *    The execution can be settled by marking it
     *    [rejected]{@link pentaho.type.action.Execution#reject} or,
     *    alternatively,
     *    [done]{@link pentaho.type.action.Execution#done}.
     *
     *    In either case, the execution transits to the _finally_ phase.
     *
     * 5. In the beginning of the **finally** phase,
     *    the execution is considered [settled]{@link pentaho.type.action.Execution#isSettled},
     *    with or without success.
     *
     *    If this phase was entered due to a rejection,
     *    the execution is in one of the states
     *    [canceled]{@link pentaho.type.action.States.canceled} or
     *    [failed]{@link pentaho.type.action.States.failed},
     *    depending on the type of rejection reason,
     *    [isRejected]{@link pentaho.type.action.Execution#isRejected} is `true`,
     *    and an [error]{@link pentaho.type.action.Execution#error} may be available.
     *
     *    Otherwise,
     *    the execution was successful and
     *    it is in the [did]{@link pentaho.type.action.States.did} state.
     *    Property [isDone]{@link pentaho.type.action.Execution#isDone} now returns `true` and
     *    a [result]{@link pentaho.type.action.Execution#result} may be available.
     *
     *    The [_onPhaseFinally]{@link pentaho.type.action.Execution#_onPhaseFinally} method is called.
     *
     *    The [finished]{@link pentaho.type.action.States.finished}
     *    [state]{@link pentaho.type.action.Execution#state} bit is set to on.
     *    Property [isFinished]{@link pentaho.type.action.Execution#isFinished} now returns `true`.
     *
     * @description Creates an action execution instance for a given action and target.
     *
     * @constructor
     * @param {!pentaho.type.action.Base} action - The action to execute. A clone of it is used.
     * @param {!pentaho.type.action.ITarget} target - The target on which to execute.
     */
    constructor: function(action, target) {

      if(!action) throw new ArgumentRequiredError("action");
      if(!target) throw new ArgumentRequiredError("target");

      // Clone action so that it can be safely frozen and
      // still allow the original action to be re-executed.
      /**
       * The action of the action execution.
       *
       * @type {!pentaho.type.action.Base}
       * @private
       */
      this.__action = action.clone();

      /**
       * The target of the action execution.
       *
       * @type {!pentaho.type.action.ITarget}
       * @private
       */
      this.__target = target;

      /**
       * The current action state.
       *
       * @type {pentaho.type.action.States}
       * @default pentaho.type.action.States.unstarted
       * @private
       */
      this.__state = States.unstarted;

      /**
       * The result of a successful action execution.
       *
       * @type {any}
       * @private
       */
      this.__result = undefined;

      /**
       * The reason for a rejected action execution.
       *
       * @type {Error}
       * @private
       */
      this.__error = null;

      /**
       * An object with a `promise` and it's controlling `resolve` and `reject` functions.
       *
       * @type {{promise: Promise, resolve: ?function(any), reject: ?function(any)}}
       * @private
       */
      this.__promiseControl = null;
    },

    /**
     * Gets the action of the action execution.
     *
     * This property returns a clone of the `action` argument passed to the constructor.
     *
     * Once the action execution enters the `will` phase,
     * this object gets frozen and can no longer be modified.
     *
     * @type {!pentaho.type.action.Base}
     * @readonly
     */
    get action() {
      return this.__action;
    },

    /**
     * Gets the target of the action execution.
     *
     * This property returns the value of the `target` argument passed to the constructor.
     *
     * @type {!pentaho.type.action.ITarget}
     * @readonly
     */
    get target() {
      return this.__target;
    },

    // region ActionExecution state and result, predicates and get/set properties

    /**
     * Gets the current action execution state.
     *
     * @type {pentaho.type.action.States}
     * @readonly
     *
     * @see pentaho.type.action.Execution#isUnstarted
     * @see pentaho.type.action.Execution#isExecuting
     * @see pentaho.type.action.Execution#isSettled
     * @see pentaho.type.action.Execution#isDone
     * @see pentaho.type.action.Execution#isRejected
     * @see pentaho.type.action.Execution#isCanceled
     * @see pentaho.type.action.Execution#isFailed
     * @see pentaho.type.action.Execution#isFinished
     */
    get state() {
      return this.__state;
    },

    /**
     * Asserts that the action is in one of a set of states.
     *
     * Receives an error message to use when the assertion fails.
     *
     * @param {pentaho.type.action.States} states - The possible states.
     * @param {string} message - The error message.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the action is not in one of the given states.
     *
     * @private
     */
    __assertStates: function(states, message) {
      if((this.__state & states) === 0) {
        throw new OperationInvalidError(message);
      }
    },

    /**
     * Gets the result of a successful action execution, if any.
     *
     * This property only returns a non-undefined value if
     * [isDone]{@link pentaho.type.action.Execution#isDone} is `true`.
     *
     * @type {any}
     * @readonly
     */
    get result() {
      return this.__result;
    },

    /**
     * Gets the reason for a rejected action execution, or `null`.
     *
     * This property only returns a non-null value if
     * [isRejected]{@link pentaho.type.action.Execution#isRejected} is `true`.
     *
     * @type {Error|pentaho.lang.UserError}
     * @readonly
     */
    get error() {
      return this.__error;
    },

    /**
     * Gets a value that indicates if the action execution is in the
     * [unstarted]{@link pentaho.type.action.States.unstarted} state.
     *
     * @type {boolean}
     * @readonly
     */
    get isUnstarted() {
      return this.__state === States.unstarted;
    },

    /**
     * Gets a value that indicates if the action execution has been settled.
     *
     * An action execution is considered _settled_ if its state has one of the following bits on:
     * [did]{@link pentaho.type.action.States.did},
     * [failed]{@link pentaho.type.action.States.failed} or
     * [canceled]{@link pentaho.type.action.States.canceled}.
     *
     * When an execution is settled it may not yet be
     * [finished]{@see pentaho.type.action.Execution#isFinished}.
     *
     * @type {boolean}
     * @readonly
     *
     * @see pentaho.type.action.Execution#isCanceled
     * @see pentaho.type.action.Execution#isFailed
     * @see pentaho.type.action.Execution#isDone
     */
    get isSettled() {
      return (this.__state & settledStates) !== 0;
    },

    /**
     * Gets a value that indicates if the action execution has been rejected.
     *
     * An action execution is considered _rejected_ if its state has one of the following bits on:
     * [canceled]{@link pentaho.type.action.States.canceled} or
     * [failed]{@link pentaho.type.action.States.failed}.
     *
     * @type {boolean}
     * @readonly
     *
     * @see pentaho.type.action.Execution#isCanceled
     * @see pentaho.type.action.Execution#isFailed
     * @see pentaho.type.action.Execution#isDone
     * @see pentaho.type.action.Execution#isSettled
     * @see pentaho.type.action.Execution#error
     */
    get isRejected() {
      return (this.__state & rejectedStates) !== 0;
    },

    /**
     * Gets a value that indicates if the action execution has been canceled.
     *
     * An action execution is considered _canceled_ if its state has the
     * [canceled]{@link pentaho.type.action.States.canceled} bit on.
     *
     * @type {boolean}
     * @readonly
     *
     * @see pentaho.type.action.Execution#isRejected
     */
    get isCanceled() {
      return (this.__state & States.canceled) !== 0;
    },

    /**
     * Gets a value that indicates if the action execution has failed.
     *
     * An action execution is considered _failed_ if its state has the
     * [failed]{@link pentaho.type.action.States.failed} bit on.
     *
     * @type {boolean}
     * @readonly
     *
     * @see pentaho.type.action.Execution#isRejected
     */
    get isFailed() {
      return (this.__state & States.failed) !== 0;
    },

    /**
     * Gets a value that indicates if the action execution is executing.
     *
     * An action execution is considered _executing_ if it has started but not yet finished,
     * i.e., if its state is not
     * the [unstarted]{@link pentaho.type.action.States.unstarted} state
     * or any of the [finished]{@link pentaho.type.action.States.finished} states.
     *
     * @type {boolean}
     * @readonly
     *
     * @see pentaho.type.action.Execution#isUnstarted
     * @see pentaho.type.action.Execution#isFinished
     */
    get isExecuting() {
      return !(this.isUnstarted || this.isFinished);
    },

    /**
     * Gets a value that indicates if the action execution completed successfully.
     *
     * An action execution is considered _done_ if its state has the
     * [did]{@link pentaho.type.action.States.did} bit on.
     *
     * @type {boolean}
     * @readonly
     *
     * @see pentaho.type.action.Execution#isSettled
     * @see pentaho.type.action.Execution#result
     */
    get isDone() {
      return (this.__state & States.did) !== 0;
    },

    /**
     * Gets a value that indicates if the action execution has finished.
     *
     * An action execution is considered _finished_ if its state has the
     * [finished]{@link pentaho.type.action.States.finished} bit on.
     *
     * When _finished_,
     * one of the bits
     * [did]{@link pentaho.type.action.States.did},
     * [canceled]{@link pentaho.type.action.States.canceled} or
     * [failed]{@link pentaho.type.action.States.failed}
     * must also be on.
     *
     * @type {boolean}
     * @readonly
     *
     * @see pentaho.type.action.Execution#isSettled
     */
    get isFinished() {
      return (this.__state & States.finished) !== 0;
    },
    // endregion

    // region promise
    /**
     * Gets a promise for the result (or error) of this action execution.
     *
     * This promise can be requested anytime,
     * before the execution has started, during execution, or after execution has finished.
     * It can also be requested whether or not the associated action is
     * [synchronous]{@link pentaho.type.action.Base.Type#isSync} or asynchronous.
     *
     * The promise is
     * fulfilled with the action execution's [result]{@link pentaho.type.action.Execution#result} or
     * rejected with the action execution's [error]{@link pentaho.type.action.Execution#error}.
     *
     * @type {!Promise}
     * @readOnly
     *
     * @rejects {Error|pentaho.type.ValidationError} The rejection reason.
     */
    get promise() {
      return this.__getPromiseControl().promise;
    },

    /**
     * Gets or creates the promise control object.
     *
     * @return {{promise: Promise, resolve: ?function(any), reject: ?function(any)}} The promise control object.
     * @private
     */
    __getPromiseControl: function() {
      return this.__promiseControl || (this.__promiseControl = this.__createPromiseControl());
    },

    /**
     * Creates a promise control object.
     *
     * @return {{promise: Promise, resolve: ?function(any), reject: ?function(any)}} A promise control object.
     * @private
     */
    __createPromiseControl: function() {

      var promiseControl = {promise: null, resolve: null, reject: null};

      if(this.isFinished) {

        promiseControl.promise = this.isDone
            ? Promise.resolve(this.result)
            : Promise.reject(this.error);
      } else {

        promiseControl.promise = new Promise(function(resolve, reject) {
          // Called synchronously.
          promiseControl.resolve = resolve;
          promiseControl.reject = reject;
        });
      }

      return promiseControl;
    },
    // endregion

    // region Execution - Main
    /**
     * Executes the action.
     *
     * When the associated action is
     * [asynchronous]{@link pentaho.type.action.Base.Type#isSync}, or
     * it is not know if it is synchronous or asynchronous,
     * upon return of this method,
     * obtain the value of the [promise]{@link pentaho.type.action.Execution#promise} property
     * and wait for its resolution.
     *
     * @return {!pentaho.type.action.Execution} The value of `this`.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the action execution is not in the
     * [unstarted]{@link pentaho.type.action.States.unstarted} state.
     */
    execute: function() {

      this.__assertStates(States.unstarted, MSG_STATE_EXECUTION_START);

      if(this.__action.$type.isSync) {
        this.__executeSyncAction();
      } else {
        this.__executeAsyncAction();
      }

      return this;
    },

    /**
     * Performs the default "execution" for the associated action.
     *
     * When the associated action is [asynchronous]{@link pentaho.type.action.Base.Type#isSync},
     * this method _may_ return a promise.
     * If the promise gets rejected, the action is rejected with the same rejection reason.
     * However, if the promise gets fulfilled, its value is always *ignored*.
     *
     * @return {Promise} - A promise for the completion of the default execution of
     * an asynchronous action, or `null`.
     *
     * @protected
     */
    _doDefault: function() {
      // noop
      return null;
    },

    // region Execution Control
    /**
     * Called from an action observer to settle the action execution as being done,
     * optionally giving a result value.
     *
     * @param {any} [result] - The result of the action execution, if any.
     * @return {pentaho.type.action.Execution} The value of `this`.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the action execution is not in the
     * [do]{@link pentaho.type.action.States.do} state.
     */
    done: function(result) {

      this.__assertStates(States["do"], MSG_STATE_DONE);

      this.__result = result;
      this.__state = States.did;

      return this;
    },

    /**
     * Called to settle the action execution as rejected.
     *
     * The execution is considered **failed** if `reason` is
     * an instance of `Error` (which is not an instance of [UserError]{@link pentaho.lang.UserError})
     * or if it is
     * an instance of [RuntimeError]{@link pentaho.lang.RuntimeError}.
     *
     * Otherwise, the execution is considered **canceled** if `reason` is
     * a string or
     * an instance of [UserError]{@link pentaho.lang.UserError}
     * (which is not an instance of [RuntimeError]{@link pentaho.lang.RuntimeError}).
     *
     * @example
     *
     * define([
     *   "pentaho/lang/UserError",
     *   "pentaho/lang/RuntimeError"
     * ], function(UserError, RuntimeError) {
     *
     *   // ...
     *
     *   target.on("fly", {
     *     will: function(event) {
     *
     *       // Canceling the action execution
     *       // - Method 1
     *       event.reject("Cannot do this action now.");
     *
     *       // - Method 2
     *       event.reject(new UserError("Cannot do this action now."));
     *
     *       // Failing the action execution
     *       // - Method 1 (message is not adequate to be shown to the user):
     *       event.reject(new Error("Null Pointer Exception."));
     *
     *       // - Method 2 (message is adequate to be shown to the user):
     *       event.reject(new RuntimeError("The server is currently unreachable."));
     *     }
     *   });
     *
     *   // ...
     * });
     *
     * @param {string|Error} [reason] - The reason for the rejection.
     *
     * @return {pentaho.type.action.Execution} The value of `this`.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the action execution is
     * not in one of the states
     * [init]{@link pentaho.type.action.States.init},
     * [will]{@link pentaho.type.action.States.will} or
     * [do]{@link pentaho.type.action.States.do}.
     *
     * @see pentaho.type.action.Execution#isRejected
     * @see pentaho.type.action.Execution#isCanceled
     * @see pentaho.type.action.Execution#isFailed
     * @see pentaho.type.action.Execution#error
     */
    reject: function(reason) {

      this.__assertStates(executingUnsettledStates, MSG_STATE_REJECT);

      this.__reject(reason);

      return this;
    },
    // endregion

    // endregion

    // region Execution - Other
    /**
     * Executes a **synchronous** action.
     *
     * @private
     */
    __executeSyncAction: function() {
      try {
        this.__executePhaseInit();

        if(!this.isSettled) {

          this.__executePhaseWill();

          if(!this.isSettled) {

            this.__executePhaseDo();
          }
        }
      } catch(ex) {
        this.__rejectOrLog(ex);
      }

      this.__executePhaseFinally();
    },

    /**
     * Executes an **asynchronous** action.
     *
     * @private
     */
    __executeAsyncAction: function() {

      var promiseFinished;
      try {
        this.__executePhaseInit();

        if(!this.isSettled) {

          this.__executePhaseWill();

          if(!this.isSettled) {

            /* eslint no-unexpected-multiline: 0 */

            promiseFinished = Promise.resolve(this.__executePhaseDo())
                ["catch"](this.__rejectOrLog.bind(this));
          }
        }
      } catch(ex) {
        this.__rejectOrLog(ex);
      }

      var boundFinally = this.__executePhaseFinally.bind(this);

      (promiseFinished || Promise.resolve()).then(boundFinally, boundFinally);
    },

    /**
     * Rejects the action execution with a given reason, if still unsettled, or logs the error, otherwise.
     *
     * @param {string|Error} [reason] - The reason for the rejection.
     *
     * @private
     */
    __rejectOrLog: function(reason) {

      if(!this.isSettled) {
        this.__reject(reason);
      } else if(debugMgr.testLevel(DebugLevels.warn, module)) {
        // Else, it is not possible to reject.
        // It's already done/rejected...
        // Log the error anyway, like what is done with errors on the _onPhaseFinally method.
        logger.warn("Ignoring error occurred after being marked done: " + reason);
      }
    },

    /**
     * Rejects the action execution with a given reason.
     *
     * If the given reason is not a string or an instance of {@link Error},
     * the action is instead rejected with an {@link pentaho.lang.ArgumentInvalidTypeError} error.
     *
     * @param {string|Error} [reason] - The reason for the rejection.
     *
     * @private
     */
    __reject: function(reason) {

      // Depends
      var isFail = false;

      if(reason) {
        if(typeof reason === "string") {
          reason = new UserError(reason);
        } else if(reason instanceof Error) {
          if(!(reason instanceof UserError) || (reason instanceof RuntimeError)) {
            isFail = true;
          }
        } else {
          reason = new ArgumentInvalidTypeError("reason", ["string", "Error"], typeof reason);
          isFail = true;
        }
      } else {
        reason = null;
      }

      this.__state = isFail ? States.failed : States.canceled;
      this.__error = reason;

      // J.I.C. of an error that occurs after being done.
      this.__result = undefined;
    },

    // region Private __executePhase* Methods
    /**
     * Executes the **init** phase.
     *
     * Changes the state to [init]{@link pentaho.type.action.States.init}
     * and delegates to [_onPhaseInit]{@link pentaho.type.action.Execution#_onPhaseInit}.
     *
     * Used by both the synchronous and the asynchronous actions.
     *
     * @private
     */
    __executePhaseInit: function() {

      this.__state = States.init;

      this._onPhaseInit();
    },

    /**
     * Executes the **will** phase.
     *
     * Validates the action.
     * When invalid, the execution is rejected with the first validation error.
     *
     * Otherwise,
     * changes the state to [will]{@link pentaho.type.action.States.will},
     * freezes the action instance and
     * delegates to [_onPhaseWill]{@link pentaho.type.action.Execution#_onPhaseWill}.
     *
     * Used by both the synchronous and the asynchronous actions.
     *
     * @private
     */
    __executePhaseWill: function() {

      // Validating here and not on the end of `__executePhaseInit`
      // ensures that isSettled is false (not rejected already).
      var errors = this.__action.validate();
      if(errors && errors.length) {
        this.__reject(errors[0]);
        return;
      }

      this.__state = States.will;
      Object.freeze(this.__action);

      this._onPhaseWill();
    },

    /**
     * Executes the **do** phase.
     *
     * Changes the state to [do]{@link pentaho.type.action.States.do}
     * and delegates to [_onPhaseDo]{@link pentaho.type.action.Execution#_onPhaseDo},
     * after which, in case the action is still executing,
     * calls the [_doDefault]{@link pentaho.type.action.Execution#_doDefault} method.
     *
     * Used by both the synchronous and the asynchronous actions.
     *
     * @return {Promise} A promise to the completion of an asynchronous _do_ phase or `null`.
     *
     * @private
     */
    __executePhaseDo: function() {

      this.__state = States["do"];

      var promise = this._onPhaseDo();

      var isSync = this.__action.$type.isSync;
      if(isSync) {
        if(!this.isSettled) {
          this._doDefault();
        }
        return null;
      }

      // Ignore promise if already settled.
      if(!promise || this.isSettled) {
        return this.__executePhaseDoDefaultAsync();
      }

      return promise.then(this.__executePhaseDoDefaultAsync.bind(this));
    },

    /**
     * Performs the default action, if the action is still unsettled.
     *
     * @return {Promise} A promise to the completion of an asynchronous _do_ phase or `null`.
     *
     * @private
     */
    __executePhaseDoDefaultAsync: function() {

      if(!this.isSettled) {

        var promise = this._doDefault();

        if(!this.isSettled) {
          return promise;
        }
      }

      return null;
    },

    /**
     * Executes the **finally** phase.
     *
     * If the action execution is still executing, calls [done]{@link pentaho.type.action.Execution#done},
     * with an `undefined` result.
     *
     * Delegates to [_onPhaseFinally]{@link pentaho.type.action.Execution#_onPhaseFinally},
     * catching and logging any error thrown by it.
     *
     * Finally,
     * the execution's [promise]{@link pentaho.type.action.Execution#promise},
     * if previously requested, is resolved.
     *
     * Used by both the synchronous and the asynchronous actions.
     *
     * @private
     */
    __executePhaseFinally: function() {

      if(!this.isSettled) {
        // Auto-fulfill the action, in case no explicit done(.) or reject(.) was called.
        this.done();
      }

      try {
        this._onPhaseFinally();
      } catch(ex) {
        // `finally` errors don't affect the outcome of the action.
        // Just log these.
        if(debugMgr.testLevel(DebugLevels.warn, module)) {
          logger.warn("Ignoring error occurred during action finally phase: " + ex + "\n Stack trace:\n" + ex.stack);
        }
      }

      this.__state |= States.finished;

      // Resolve the promise, if there is one, in which case it surely
      // is not settled, as only now the state has been made finished...
      var promiseControl = this.__promiseControl;
      if(promiseControl) {
        if(this.isDone) {
          promiseControl.resolve(this.result);
        } else {
          promiseControl.reject(this.error);
        }
      }
    },
    // endregion

    // region Protected _onPhase* methods
    /**
     * Called during the action execution's **initialize** phase.
     *
     * The default implementation does nothing.
     *
     * @protected
     */
    _onPhaseInit: function() {
    },

    /**
     * Called during the action execution's _will_ phase.
     *
     * The default implementation does nothing.
     *
     * @protected
     */
    _onPhaseWill: function() {
    },

    /**
     * Called during the action's **do** phase.
     *
     * The default implementation does nothing.
     *
     * @return {?Promise} A promise to the completion of the asynchronous `do` listener,
     * of an [asynchronous]{@link pentaho.type.action.Base.Type#isSync} action, or `null`.
     *
     * @protected
     */
    _onPhaseDo: function() {
      return null;
    },

    /**
     * Called during the action's **finally** phase.
     *
     * The default implementation does nothing.
     *
     * @protected
     */
    _onPhaseFinally: function() {
    }
    // endregion
    // endregion
  });
});
