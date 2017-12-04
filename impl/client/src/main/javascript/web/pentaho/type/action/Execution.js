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
  var executingStates = States.init | States.will | States["do"];

  /** @type pentaho.type.action.States */
  var rejectedStates = States.canceled | States.failed;

  /** @type pentaho.type.action.States */
  var finishedStates = States.did | rejectedStates;

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
     *    it is in the [unstarted]{@link pentaho.type.action.States#unstarted} state.
     *
     *    The action's
     *    [label]{@link pentaho.type.action.Base#label} and
     *    [description]{@link pentaho.type.action.Base#description} properties,
     *    and any other property which defines what it ultimately does,
     *    can still be freely modified.
     *
     *    In this state,
     *    the execution cannot be
     *    [marked done]{@link pentaho.type.action.Execution#done} or
     *    [be rejected]{@link pentaho.type.action.Execution#reject}.
     *
     * 2. When the [execute]{@link pentaho.type.action.Execution#execute} method is called,
     *    the execution enters the **init** phase:
     *    -  its state is set to [init]{@link pentaho.type.action.States#init};
     *    -  the [_onPhaseInit]{@link pentaho.type.action.Execution#_onPhaseInit} method is called.
     *
     *    The action's
     *    [label]{@link pentaho.type.action.Base#label} and
     *    [description]{@link pentaho.type.action.Base#description} properties,
     *    and any other property which defines what it ultimately does,
     *    can still be freely modified.
     *
     *    The execution can
     *    [be rejected]{@link pentaho.type.action.Execution#reject}
     *    in which case it transits to the _finally_ phase.
     *
     *    Otherwise, the execution automatically transits to the _will_ phase.
     *
     * 3. In the **will** phase,
     *    what the associated action will do is already settled and cannot change anymore:
     *    - the execution's state is set to [will]{@link pentaho.type.action.States#will};
     *    - the associated action is frozen, using {@link Object.freeze},
     *      and should **not** be modified anymore (e.g. by modifying nested objects);
     *      trying to modify direct properties of the action will throw a {@link TypeError};
     *    - the [_onPhaseWill]{@link pentaho.type.action.Execution#_onPhaseWill} method is called.
     *
     *    From this point on, an execution can be canceled based on what exactly
     *    the associated action will do.
     *
     *    The execution can
     *    [be rejected]{@link pentaho.type.action.Execution#reject},
     *    in which case it transits to the _finally_ phase.
     *
     *    Otherwise, the execution automatically transits to the _do_ phase.
     *
     * 4. In the **do** phase, the execution, proper, is carried out:
     *    - the execution's state is set to [do]{@link pentaho.type.action.States#do};
     *    - the [_onPhaseDo]{@link pentaho.type.action.Execution#_onPhaseDo} method is called.
     *    - if after calling `_onPhaseDo`, the execution is not yet done or rejected,
     *      the [_doDefault]{@link pentaho.type.action.Execution#_doDefault} method is called,
     *      allowing the action execution class to clearly handle a default behaviour.
     *
     *    The execution can
     *    [be rejected]{@link pentaho.type.action.Execution#reject}.
     *    Alternatively,
     *    the execution can be [marked done]{@link pentaho.type.action.Execution#done}.
     *
     *    In either case, the execution transits to the _finally_ phase.
     *
     * 5. In the **finally** phase,
     *    the execution is considered [finished]{@link pentaho.type.action.Execution#isFinished},
     *    with or without success.
     *
     *    If this phase was entered due to a rejection,
     *    the execution is in one of the states
     *    [canceled]{@link pentaho.type.action.States#canceled} or
     *    [failed]{@link pentaho.type.action.States#failed},
     *    depending on the type of rejection reason,
     *    [isRejected]{@link pentaho.type.action.Execution#isRejected} is `true`,
     *    and an [error]{@link pentaho.type.action.Execution#error} may be available.
     *
     *    Otherwise,
     *    the execution was successful,
     *    it is in the [did]{@link pentaho.type.action.States#did} state,
     *    [isDone]{@link pentaho.type.action.Execution#isDone} is `true`,
     *    and a [result]{@link pentaho.type.action.Execution#result} may be available.
     *
     *    The [_onPhaseFinally]{@link pentaho.type.action.Execution#_onPhaseFinally} method is called.
     *
     * @description Creates an action execution instance for a given action and target.
     *
     * @constructor
     * @param {!pentaho.type.action.Base} action - The action to execute. A clone of it is used.
     * @param {!pentaho.type.action.ITarget} target - The target on which to execute.
     */
    constructor: function(action, target) {

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
     * This property contains a clone of the `action` argument passed to the constructor.
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
     * This property contains the value of the `target` argument passed to the constructor.
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
     */
    get state() {
      return this.__state;
    },

    /**
     * Asserts that the action is in one of a set of states.
     *
     * Optionally, receives an error message to use when the assertion fails.
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
     * This property can only return a non-undefined value if
     * {@link pentaho.type.action.Execution#isDone} is `true`.
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
     * This property can only return a non-null value if
     * {@link pentaho.type.action.Execution#isRejected} is `true`.
     *
     * @type {Error|pentaho.lang.UserError}
     * @readonly
     */
    get error() {
      return this.__error;
    },

    /**
     * Gets a value that indicates if the action execution is in a unstarted state.
     *
     * @type {boolean}
     * @readonly
     */
    get isUnstarted() {
      return this.__state === States.unstarted;
    },

    /**
     * Gets a value that indicates if the action execution has been rejected.
     *
     * An action execution is considered rejected if its state is one of
     * [init]{@link pentaho.type.action.States.canceled} or
     * [will]{@link pentaho.type.action.States.failed}.
     *
     * @type {boolean}
     * @readonly
     *
     * @see pentaho.type.action.Execution#isCanceled
     * @see pentaho.type.action.Execution#isFailed
     * @see pentaho.type.action.Execution#isDone
     * @see pentaho.type.action.Execution#isFinished
     * @see pentaho.type.action.Execution#error
     */
    get isRejected() {
      return (this.__state & rejectedStates) !== 0;
    },

    /**
     * Gets a value that indicates if the action execution has been canceled.
     *
     * @type {boolean}
     * @readonly
     *
     * @see pentaho.type.action.Execution#isRejected
     */
    get isCanceled() {
      return this.__state === States.canceled;
    },

    /**
     * Gets a value that indicates if the action execution has failed.
     *
     * @type {boolean}
     * @readonly
     *
     * @see pentaho.type.action.Execution#isRejected
     */
    get isFailed() {
      return this.__state === States.failed;
    },

    /**
     * Gets a value that indicates if the action execution is executing.
     *
     * An action execution is considered _executing_ if its state is one of
     * [init]{@link pentaho.type.action.States.init},
     * [will]{@link pentaho.type.action.States.will} or
     * [do]{@link pentaho.type.action.States.do}.
     *
     * @type {boolean}
     * @readonly
     *
     * @see pentaho.type.action.Execution#isUnstarted
     * @see pentaho.type.action.Execution#isFinished
     */
    get isExecuting() {
      return (this.__state & executingStates) !== 0;
    },

    /**
     * Gets a value that indicates if the action execution completed successfully.
     *
     * @type {boolean}
     * @readonly
     *
     * @see pentaho.type.action.Execution#result
     */
    get isDone() {
      return this.__state === States.did;
    },

    /**
     * Gets a value that indicates if the action execution has finished.
     *
     * An action execution has finished if its state is one of
     * [did]{@link pentaho.type.action.States.did},
     * [canceled]{@link pentaho.type.action.States.canceled} or
     * [failed]{@link pentaho.type.action.States.failed}.
     *
     * @type {boolean}
     * @readonly
     *
     * @see pentaho.type.action.Execution#isDone
     * @see pentaho.type.action.Execution#isCanceled
     * @see pentaho.type.action.Execution#isFailed
     */
    get isFinished() {
      return (this.__state & finishedStates) !== 0;
    },
    // endregion

    // region promise
    /**
     * Gets a promise for the result (or error) of this action execution.
     *
     * This promise can be requested anytime,
     * before the execution is started, during execution, or after execution has finished.
     * Also, it can be requested whether or not the associated action is
     * [synchronous]{@link pentaho.type.action.Base.Type#isSync} or asynchronous.
     *
     * The promise is
     * fulfilled with the action execution's [result]{@link pentaho.type.action.Execution#result} or
     * rejected with the action execution's [error]{@link pentaho.type.action.Execution#error}.
     *
     * @type {!Promise}
     * @readOnly
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
     * If the associated action is not [valid]{@link pentaho.type.action.Execution#validate},
     * execution does not start and the first reported validation error is thrown.
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
     *
     * @throws {pentaho.type.ValidationError} When the associated action is not valid.
     */
    execute: function() {

      this.__assertStates(States.unstarted, MSG_STATE_EXECUTION_START);

      var action = this.__action;

      var errors = action.validate();
      if(errors && errors.length) {
        throw errors[0];
      }

      if(action.$type.isSync) {
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
     * Called from an action observer to mark the action execution as being done,
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
     * Called to mark the action execution as rejected.
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
     * @throws {pentaho.lang.OperationInvalidError} When the action execution is not
     * [executing]{@link pentaho.type.action.Execution#isExecuting}.
     *
     * @see pentaho.type.action.Execution#isRejected
     * @see pentaho.type.action.Execution#isCanceled
     * @see pentaho.type.action.Execution#isFailed
     * @see pentaho.type.action.Execution#error
     */
    reject: function(reason) {

      this.__assertStates(executingStates, MSG_STATE_REJECT);

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

        if(this.isExecuting) {

          this.__executePhaseWill();

          if(this.isExecuting) {

            this.__executePhaseDo();
          }
        }
      } catch(ex) {
        this.__reject(ex);
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

        if(this.isExecuting) {

          this.__executePhaseWill();

          if(this.isExecuting) {

            /* eslint no-unexpected-multiline: 0 */

            promiseFinished = Promise.resolve(this.__executePhaseDo())
                ["catch"](this.__reject.bind(this));
          }
        }
      } catch(ex) {
        this.__reject(ex);
      }

      (promiseFinished || Promise.resolve()).then(this.__executePhaseFinally.bind(this));
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
     * Changes the state to [will]{@link pentaho.type.action.States.will}
     * and delegates to [_onPhaseWill]{@link pentaho.type.action.Execution#_onPhaseWill}.
     *
     * Used by both the synchronous and the asynchronous actions.
     *
     * @private
     */
    __executePhaseWill: function() {

      this.__state = States.will;

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
      Object.freeze(this.__action);

      var promise = this._onPhaseDo();

      var isSync = this.__action.$type.isSync;
      if(isSync) {
        maybeDoDefault.call(this);
        return null;
      }

      return (promise || Promise.resolve()).then(maybeDoDefault.bind(this));

      /**
       * Performs the default action, if the action is still executing.
       *
       * @return {Promise} A promise to the completion of an asynchronous _do_ phase or `null`.
       */
      function maybeDoDefault() {
        return this.isExecuting ? this._doDefault() : null;
      }
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

      if(this.isExecuting) {
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

      // Resolve the promise, if there is one.
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
