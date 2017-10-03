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
  "module",
  "./States",
  "pentaho/lang/ArgumentRequiredError",
  "pentaho/lang/ArgumentInvalidTypeError",
  "pentaho/lang/OperationInvalidError",
  "pentaho/lang/UserError",
  "pentaho/lang/RuntimeError",
  "pentaho/debug",
  "pentaho/debug/Levels",
  "pentaho/util/logger",
  "pentaho/util/object"
], function(module, States, ArgumentRequiredError, ArgumentInvalidTypeError, OperationInvalidError,
            UserError, RuntimeError, debugMgr, DebugLevels, logger, O) {

  "use strict";

  /* eslint dot-notation: 0 */

  return ["element", function(Element) {

    var actionType;

    /**
     * @name pentaho.type.action.Base.Type
     * @class
     * @extends pentaho.type.Element.Type
     *
     * @classDesc The base class of action types.
     *
     * For more information see {@link pentaho.type.action.Base}.
     */

    // override the documentation to specialize the argument types.
    /**
     * Creates a subtype of this one.
     *
     * For more information on class extension, in general,
     * see {@link pentaho.lang.Base.extend}.
     *
     * @name extend
     * @memberOf pentaho.type.action.Base
     * @method
     *
     * @param {string} [name] The name of the created class; used for debugging purposes.
     * @param {pentaho.type.action.spec.IBaseProto} [instSpec] The instance specification.
     * @param {Object} [classSpec] The static specification.
     * @param {Object} [keyArgs] The keyword arguments.
     *
     * @return {!Class.<pentaho.type.Value>} The new value instance subclass.
     *
     * @see pentaho.type.Instance.extend
     */

    var executingStates = States.init | States.will | States["do"];
    var rejectedStates = States.canceled | States.failed;
    var finishedStates = States.did | rejectedStates;
    var cancelableStates = States.init | States.will;

    var Action = Element.extend(/** @lends pentaho.type.action.Base# */{

      $type: /** @lends pentaho.type.action.Base.Type# */{
        isAbstract: true,

        _init: function(spec, keyArgs) {

          this.base(spec, keyArgs);

          var isSync = spec && spec.isSync;
          if(isSync == null) isSync = this.__isSync;
          O.setConst(this, "__isSync", !!isSync);
        },

        // region Attribute isSync
        __isSync: true,

        /**
         * Gets a value that indicates if the action is synchronous.
         *
         * @type {boolean}
         * @readOnly
         */
        get isSync() {
          return this.__isSync;
        },
        // endregion

        // region serialization
        /** @inheritDoc */
        _fillSpecInContext: function(spec, keyArgs) {

          var any = this.base(spec, keyArgs);

          if(this !== actionType && this.isSync !== this.ancestor.isSync) {
            spec.isSync = this.isSync;
            any = true;
          }

          return any;
        }
        // endregion
      },

      /**
       * @alias Base
       * @memberOf pentaho.type.action
       * @class
       * @extends pentaho.type.Element
       * @abstract
       *
       * @amd {pentaho.type.spec.UTypeModule<pentaho.type.action.Base>} pentaho/type/action/base
       *
       * @classDesc The `action.Base` class represents a certain model of actions.
       *
       * This class, the instance class, manages the execution of the action
       * and enforces the multiple phases by which all actions, generically, go through it,
       * including: "init", "will", "do", and "finally".
       *
       * Note that the associated type class is to be used to configure metadata information
       * about actions. For example: [label]{@link pentaho.type.Type#label} and
       * [description]{@link pentaho.type.Type#description} metadata are
       * to be used in user interfaces to portray the action to the user.
       *
       * ##### Synchronous or Asynchronous
       *
       * An action can be synchronous or asynchronous, as determined by the type property,
       * [Base.Type#isSync]{@link pentaho.type.action.Base.Type#isSync}.
       * The execution of a synchronous action is completed synchronously.
       * An asynchronous action, however, has an asynchronous "do" phase,
       * and thus only fully completes asynchronously.
       * To support these two kinds of actions, two execution methods exist:
       * [execute]{@link pentaho.type.action.Base#execute} and
       * [executeAsync]{@link pentaho.type.action.Base#executeAsync}.
       * For an unknown kind of action, use execute if you are not concerned about the outcome
       * of the action execution. Use executeAsync if you are concerned about the outcome of the action.
       *
       * ##### Action model
       *
       * The following is a detailed description of the action model:
       *
       * 1. When an action is constructed, it is in the [candidate]{@link pentaho.type.action.States#candidate} state.
       *    It merely represents a possible, or candidate, action that can be executed.
       *
       *    At this point, it has no associated [target]{@link pentaho.type.action.Base#target}
       *    or [_executor]{@link pentaho.type.action.Base#_executor}.
       *
       *    Its [label]{@link pentaho.type.action.Base#label} and
       *    [description]{@link pentaho.type.action.Base#description},
       *    and anything else that defines exactly what the action ultimately does,
       *    can still be freely modified.
       *
       *    In this state, the action cannot be marked
       *    [done]{@link pentaho.type.action.Base#done} or be
       *    [rejected]{@link pentaho.type.action.Base#reject}.
       *
       * 2. When either
       *    the [execute]{@link pentaho.type.action.Base#execute} or
       *    the [executeAsync]{@link pentaho.type.action.Base#executeAsync} method is called,
       *    the action enters the **init** phase and is set to the [init]{@link pentaho.type.action.States#init} state.
       *
       *    The action's [target]{@link pentaho.type.action.Base#target} and
       *    [_executor]{@link pentaho.type.action.Base#_executor} are set to the ones provided as arguments in
       *    the said methods.
       *
       *    The [_onPhaseInit]{@link pentaho.type.action.Base#_onPhaseInit} method is called,
       *    which, by default,
       *    delegates to the set [executor]{@link pentaho.type.action.Base#_executor}, if any,
       *    by calling its [init]{@link pentaho.type.action.IObserver#init} method.
       *
       *    The action's [label]{@link pentaho.type.action.Base#label} and
       *    [description]{@link pentaho.type.action.Base#description},
       *    and anything else that defines exactly what the action ultimately does,
       *    can still be freely modified.
       *
       *    The action can be marked [rejected]{@link pentaho.type.action.Base#reject},
       *    in which case it is set to either
       *    the [canceled]{@link pentaho.type.action.States#canceled} or
       *    the [failed]{@link pentaho.type.action.States#failed} state,
       *    and the _finally_ phase is entered.
       *
       *    Otherwise, the action automatically transits to the _will_ phase.
       *
       * 3. In the **will** phase, what the action will do,
       *    along with its
       *    [label]{@link pentaho.type.action.Base#label} and
       *    [description]{@link pentaho.type.action.Base#description},
       *    is now settled and cannot be changed anymore --
       *    an action can now be canceled based on what exactly it will do.
       *
       *    The action is set to the [will]{@link pentaho.type.action.States#will} state.
       *
       *    From now on,
       *    calling [isEditable]{@link pentaho.type.action.Base#isEditable} will return `false`
       *    and calling [_assertEditable]{@link pentaho.type.action.Base#_assertEditable} will throw an error.
       *
       *    The [_onPhaseWill]{@link pentaho.type.action.Base#_onPhaseWill} method is called,
       *    which, by default,
       *    delegates to the set [executor]{@link pentaho.type.action.Base#_executor}, if any,
       *    by calling its [will]{@link pentaho.type.action.IObserver#will} method.
       *
       *    The action can be marked [rejected]{@link pentaho.type.action.Base#reject},
       *    in which case it is set to either
       *    the [canceled]{@link pentaho.type.action.States#canceled} or
       *    the [failed]{@link pentaho.type.action.States#failed} state,
       *    and the _finally_ phase is entered.
       *
       *    Otherwise, the action automatically transits to the _do_ phase.
       *
       * 4. In the **do** phase, the action execution, proper, is carried out.
       *    The action is set to the [do]{@link pentaho.type.action.States#do} state.
       *
       *    The [_onPhaseDo]{@link pentaho.type.action.Base#_onPhaseDo} method is called,
       *    which, by default,
       *    delegates to the set [executor]{@link pentaho.type.action.Base#_executor}, if any,
       *    by calling its [do]{@link pentaho.type.action.IObserver#do} method.
       *
       *    The action cannot be canceled anymore, but can, however, be marked _failed_,
       *    by [rejecting]{@link pentaho.type.action.Base#reject} it with a runtime error,
       *    in which case it is set to the [failed]{@link pentaho.type.action.States#failed} state,
       *    and the _finally_ phase is entered.
       *
       *    Alternatively, the action can be marked [done]{@link pentaho.type.action.Base#done}.
       *
       *    If after calling `_onPhaseDo` the action is not yet done or rejected,
       *    the [_doDefault]{@link pentaho.type.action.Base#_doDefault} is called,
       *    allowing the action class to provide a default implementation.
       *
       *    Finally, the action is set to the [did]{@link pentaho.type.action.States#did} state,
       *    and the _finally_ phase is entered.
       *
       * 5. When in the **finally** phase, the action is [finished]{@link pentaho.type.action.Base#isFinished},
       *    with or without success,
       *    and is in one of the
       *    [canceled]{@link pentaho.type.action.States#canceled},
       *    [failed]{@link pentaho.type.action.States#failed} or
       *    [did]{@link pentaho.type.action.States#did}
       *    states.
       *
       *    The [_onPhaseFinally]{@link pentaho.type.action.Base#_onPhaseFinally} method is called,
       *    which, by default,
       *    delegates to the set [executor]{@link pentaho.type.action.Base#_executor}, if any,
       *    by calling its [finally]{@link pentaho.type.action.IObserver#finally} method.
       *
       *    If the action was [done]{@link pentaho.type.action.Base#isDone},
       *    an action [result]{@link pentaho.type.action.Base#result} may be available,
       *    while if the action was [rejected]{@link pentaho.type.action.Base#isRejected},
       *    an action [error]{@link pentaho.type.action.Base#error} may be available.
       *
       * @description Creates an action instance given its specification.
       *
       * @constructor
       * @param {pentaho.type.action.spec.IBase} [spec] An action specification.
       *
       * @see pentaho.type.action.spec.IBase
       * @see pentaho.type.action.spec.IBaseProto
       * @see pentaho.type.action.spec.IBaseTypeProto
       */
      constructor: function(spec) {
        /**
         * The current action state.
         *
         * @type {pentaho.type.action.States}
         * @default pentaho.type.action.States.candidate
         * @private
         */
        this.__state = States.candidate;

        /**
         * The target where the action is executing or has executed.
         *
         * @type {pentaho.type.action.ITarget}
         * @private
         */
        this.__target = null;

        /**
         * The observer that is executing the action.
         *
         * This field is set when execution starts and cleared once it finishes.
         *
         * @type {pentaho.type.action.IObserver}
         * @private
         */
        this.__executor = null;

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
         * The label of the action instance.
         *
         * @type {__nonEmptyString}
         * @private
         */
        this.__label = __nonEmptyString(spec && spec.label);

        /**
         * The description of the action instance.
         *
         * @type {!__nonEmptyString}
         * @private
         */
        this.__description = __nonEmptyString(spec && spec.description);

        /**
         * An object with a `promise` and it's controlling `resolve` and `reject` functions.
         *
         * @type {{promise: Promise, resolve: ?function(any), reject: ?function(any)}}
         * @private
         */
        this.__promiseControl = null;
      },

      /** @inheritDoc */
      clone: function() {
        return new this.constructor(this.toSpec());
      },

      // region Action Description
      /**
       * Gets or sets the label of this action.
       *
       * When not set to a non-empty local value, the label of the action type,
       * {@link pentaho.type.Type#label} is returned.
       *
       * Can only be set while the action is in an [editable]{@link pentaho.type.action.Base#isEditable} state.
       *
       * @type {__nonEmptyString}
       * @throws {pentaho.lang.OperationInvalidError} When set and the action is not in an editable state.
       */
      get label() {
        return this.__label || this.$type.label;
      },

      set label(value) {

        this._assertEditable();
        this.__label = __nonEmptyString(value);
      },

      /**
       * Gets or sets the description of this action.
       *
       * When not set to a non-empty local value, the description of the action type,
       * {@link pentaho.type.Type#description} is returned.
       *
       * Can only be set while the action is in an [editable]{@link pentaho.type.action.Base#isEditable} state.
       *
       * @type {__nonEmptyString}
       * @throws {pentaho.lang.OperationInvalidError} When set and the action is not in an editable state.
       */
      get description() {
        return this.__description || this.$type.description;
      },

      set description(value) {

        this._assertEditable();
        this.__description = __nonEmptyString(value);
      },
      // endregion

      // region Action state and result, predicates and get/set properties

      /**
       * Gets the current action state.
       *
       * @type {pentaho.type.action.States}
       * @readonly
       */
      get state() {
        return this.__state;
      },

      /**
       * Asserts that the action is editable and throws an error if not.
       *
       * Call this helper method at the start of _general_ property setters.
       *
       * @protected
       *
       * @throws {pentaho.lang.OperationInvalidError} When the action is not editable.
       */
      _assertEditable: function() {
        if(!this.isEditable) {
          throw new OperationInvalidError("Action can only be changed while it is editable.");
        }
      },

      /**
       * Asserts that the action is in one of a set of states.
       *
       * @param {pentaho.type.action.States} states - The possible states.
       * @throws {pentaho.lang.OperationInvalidError} When the action is not in one of the given states.
       *
       * @private
       */
      __assertStates: function(states) {
        if(!(this.__state & states)) {
          throw this.__invalidState();
        }
      },

      /**
       * Creates an invalid state error.
       *
       * @return {pentaho.lang.OperationInvalidError} The invalid state error.
       * @private
       */
      __invalidState: function() {
        return new OperationInvalidError("Action cannot perform the operation in the current state.");
      },

      /**
       * Gets the result of a successful action execution, if any.
       *
       * This property can only return a non-undefined value if
       * {@link pentaho.type.action.Base#isDone} is `true`.
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
       * {@link pentaho.type.action.Base#isRejected} is `true`.
       *
       * @type {Error|pentaho.lang.UserError}
       * @readonly
       */
      get error() {
        return this.__error;
      },

      /**
       * Gets a value that indicates if the action is editable.
       *
       * An action is considered editable if its state is one of
       * [init]{@link pentaho.type.action.States.candidate} or
       * [will]{@link pentaho.type.action.States.init}.
       *
       * @type {boolean}
       * @readonly
       */
      get isEditable() {
        return this.__state <= States.init;
      },

      /**
       * Gets a value that indicates if the action has been rejected.
       *
       * An action is considered rejected if its state is one of
       * [init]{@link pentaho.type.action.States.canceled} or
       * [will]{@link pentaho.type.action.States.failed}.
       *
       * @type {boolean}
       * @readonly
       *
       * @see pentaho.type.action.Base#isCanceled
       * @see pentaho.type.action.Base#isFailed
       * @see pentaho.type.action.Base#isDone
       * @see pentaho.type.action.Base#isFinished
       * @see pentaho.type.action.Base#error
       */
      get isRejected() {
        return (this.__state & rejectedStates) !== 0;
      },

      /**
       * Gets a value that indicates if the action has been canceled.
       *
       * @type {boolean}
       * @readonly
       *
       * @see pentaho.type.action.Base#isRejected
       */
      get isCanceled() {
        return this.__state === States.canceled;
      },

      /**
       * Gets a value that indicates if the action has failed.
       *
       * @type {boolean}
       * @readonly
       *
       * @see pentaho.type.action.Base#isRejected
       */
      get isFailed() {
        return this.__state === States.failed;
      },

      /**
       * Gets a value that indicates if the action is in a candidate state.
       *
       * @type {boolean}
       * @readonly
       */
      get isCandidate() {
        return this.__state === States.candidate;
      },

      /**
       * Gets a value that indicates if the action is executing.
       *
       * An action is executing if its state is one of
       * [init]{@link pentaho.type.action.States.init},
       * [will]{@link pentaho.type.action.States.will} or
       * [do]{@link pentaho.type.action.States.do}.
       *
       * @type {boolean}
       * @readonly
       *
       * @see pentaho.type.action.Base#isCandidate
       * @see pentaho.type.action.Base#isFinished
       */
      get isExecuting() {
        return (this.__state & executingStates) !== 0;
      },

      /**
       * Gets a value that indicates if the action executed successfully.
       *
       * @type {boolean}
       * @readonly
       *
       * @see pentaho.type.action.Base#result
       */
      get isDone() {
        return this.__state === States.did;
      },

      /**
       * Gets a value that indicates if the action has finished execution.
       *
       * An action has finished execution if its state is one of
       * [did]{@link pentaho.type.action.States.did},
       * [canceled]{@link pentaho.type.action.States.canceled} or
       * [failed]{@link pentaho.type.action.States.failed}.
       *
       * @type {boolean}
       * @readonly
       *
       * @see pentaho.type.action.Base#isDone
       * @see pentaho.type.action.Base#isCanceled
       * @see pentaho.type.action.Base#isFailed
       */
      get isFinished() {
        return (this.__state & finishedStates) !== 0;
      },
      // endregion

      // region promise
      /**
       * Gets a promise for the result (or error) of this action's execution, if ever.
       *
       * This promise can be requested anytime,
       * before starting execution, during execution, or after finishing execution of this action.
       * Also, it can be requested whether or not the action is
       * [synchronous]{@link pentaho.type.action.Base.Type#isSync} or asynchronous.
       *
       * The promise is fulfilled with the action's [result]{@link pentaho.type.action.Base#result}
       * or rejected with the action's [error]{@link pentaho.type.action.Base#error}.
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

        var promiseControl = {promise: null};

        if(this.isFinished) {

          promiseControl.promise = this.isDone
              ? Promise.resolve(this.result)
              : Promise.reject(this.error);
        } else {

          promiseControl.promise = new Promise(function(resolve, reject) {
            promiseControl.resolve = resolve;
            promiseControl.reject = reject;
          });

          return promiseControl;
        }
      },
      // endregion

      // region Execution - Main
      /**
       * Executes the action on a given target and, optionally, with a given executor,
       * and does not wait for its outcome.
       *
       * This method can be called on [synchronous]{@link pentaho.type.action.Base.Type#isSync} or asynchronous actions.
       * However, in the latter case, this method is only suitable for _fire-and-forget_ scenarios,
       * where it is not needed to know the action outcome.
       *
       * @param {!pentaho.type.action.ITarget} target - The action's target.
       * @param {pentaho.type.action.IObserver} [executor] - An action observer to act as action controller/executor.
       * Unlike normal event/action observers, the functions of executor observers are called with the executor
       * as the value of the JavaScript `this` context.
       *
       * @return {!pentaho.type.action.Base} The value of `this`.
       *
       * @see pentaho.type.action.ITarget#executeAsync
       * @see pentaho.type.action.ITarget#act
       */
      execute: function(target, executor) {

        this.__validateAction(target);

        this.__executeAction(executor);

        return this;
      },

      /**
       * Executes the action on a given target and, optionally, with a given executor, and waits for its outcome.
       *
       * This method can be called on [synchronous]{@link pentaho.type.action.Base.Type#isSync} or asynchronous actions,
       * and can be used when uniformity in treatment is desired and it is needed to know their outcome.
       *
       * @param {!pentaho.type.action.ITarget} target - The action's target.
       * @param {pentaho.type.action.IObserver} [executor] - An action observer to act as action controller/executor.
       * Unlike normal event/action observers, the functions of executor observers are called with the executor
       * as the value of the JavaScript `this` context.
       *
       * @return {!Promise} A promise that is fulfilled with the action's
       * [result]{@link pentaho.type.action.Base#result} or rejected with the action's
       * [error]{@link pentaho.type.action.Base#error}.
       *
       * @see pentaho.type.action.ITarget#execute
       * @see pentaho.type.action.ITarget#actAsync
       */
      executeAsync: function(target, executor) {

        try {
          this.__validateAction(target);
        } catch(ex) {
          return Promise.reject(ex);
        }

        this.__executeAction(executor);

        return this.promise;
      },

      // region target
      /**
       * Gets the target where the action is executing or has executed.
       *
       * This property contains the value of the `target` argument passed to
       * [execute]{@link pentaho.type.action.Base#execute} or
       * [executeAsync]{@link pentaho.type.action.Base#executeAsync},
       * and is `null` before execution.
       *
       * @type {pentaho.type.action.ITarget}
       * @readonly
       */
      get target() {
        return this.__target;
      },

      /**
       * Called to validate and set the action's target, upon execution.
       *
       * Override to perform additional validations _after_ calling the base implementation.
       *
       * @param {pentaho.type.action.ITarget} target - The action's target.
       *
       * @protected
       */
      _setTarget: function(target) {

        if(!target) throw new ArgumentRequiredError("target");

        this.__target = target;
      },
      // endregion

      /**
       * Gets the executor to which the actual action execution is delegated.
       *
       * This property contains the value of the `executor` argument passed to
       * [execute]{@link pentaho.type.action.Base#execute} or
       * [executeAsync]{@link pentaho.type.action.Base#executeAsync},
       * and is `null` before execution.
       *
       * @type {pentaho.type.action.IObserver}
       * @readonly
       * @protected
       */
      get _executor() {
        return this.__executor;
      },

      /**
       * Performs the default "action" of this action.
       *
       * When the action is [asynchronous]{@link pentaho.type.action.Base.Type#isSync},
       * this method _may_ return a promise. If the promise is rejected,
       * the action is rejected with the rejection reason.
       * However, if the promise is fulfilled, its value is always *ignored*.
       *
       * @return {Promise} - A promise for the completion of the default action of an asynchronous action, or `null`.
       */
      _doDefault: function() {
        // noop
        return null;
      },

      // region Execution Control
      /**
       * Called from an action observer to mark the action as being done, optionally given a result value.
       *
       * @param {any} [result] - The result of the action, if any.
       * @return {pentaho.type.action.Base} The value of `this`.
       *
       * @throws {pentaho.lang.OperationInvalidError} When the action is not in the
       * [do]{@link pentaho.type.action.States.do} state.
       */
      done: function(result) {

        this.__assertStates(States["do"]);

        this.__result = result;
        this.__state = States.did;

        return this;
      },

      /**
       * Called from an action observer to mark the action as rejected.
       *
       * The action is considered **failed** if `reason` is
       * an instance of `Error` (that is not an instance of [UserError]{@link pentaho.lang.UserError})
       * or if it is
       * an instance of [RuntimeError]{@link pentaho.lang.RuntimeError}.
       *
       * Otherwise, the action is considered **canceled** if `reason` is
       * a string or
       * an instance of [UserError]{@link pentaho.lang.UserError}
       * (that is not an instance of [RuntimeError]{@link pentaho.lang.RuntimeError}).
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
       *     will: function(action) {
       *       // Canceling the action
       *       // .. Method 1
       *       action.reject("Cannot do this action now.");
       *
       *       // .. Method 2
       *       action.reject(new UserError("Cannot do this action now."));
       *
       *       // Failing the action
       *       // .. Method 1 - message is not adequate to be shown to the user.
       *       action.reject(new Error("Null Pointer Exception."));
       *
       *       // .. Method 2 - message is adequate to be shown to the user.
       *       action.reject(new RuntimeError("The server is currently unreachable."));
       *     }
       *   });
       *
       *   // ...
       * });
       *
       * @param {string|Error} [reason] - The reason for the rejection.
       *
       * @return {pentaho.type.action.Base} The value of `this`.
       *
       * @throws {pentaho.lang.OperationInvalidError} When canceling and the action is not in one of the states
       * [init]{@link pentaho.type.action.States.init} or [will]{@link pentaho.type.action.States.will}.
       *
       * @throws {pentaho.lang.OperationInvalidError} When failing and the action is not
       * [executing]{@link pentaho.type.action.Base#isExecuting}.
       *
       * @see pentaho.type.action.Base#isRejected
       * @see pentaho.type.action.Base#isCanceled
       * @see pentaho.type.action.Base#isFailed
       * @see pentaho.type.action.Base#error
       */
      reject: function(reason) {

        // Test all possible states upfront.
        this.__assertStates(executingStates);

        this.__reject(reason);

        return this;
      },
      // endregion

      // endregion

      // region Execution - Other
      /**
       * Setups the target and validates if the action can start executing.
       *
       * Throws if the action execution cannot start.
       *
       * @param {!pentaho.type.action.ITarget} target - The action's target.
       *
       * @throws {Error} When the action execution cannot start.
       *
       * @private
       */
      __validateAction: function(target) {

        // Take care to test the correct state before overwriting the current promise.
        // Also, need to return a different promise in this case.
        this.__assertStates(States.candidate);

        try {
          this._setTarget(target);
        } catch(ex) {
          this.__target = null;
          throw ex;
        }

        var errors = this.validate();
        if(errors && errors.length) {
          this.__target = null;
          throw errors[0];
        }
      },

      /**
       * Sets the executor and dispatches the execution of the action
       * to either the synchronous or asynchronous lifecycle.
       *
       * @param {pentaho.type.action.IObserver} executor - An action observer to act as action controller/executor.
       *
       * @private
       */
      __executeAction: function(executor) {

        this.__executor = executor || null;

        if(this.$type.isSync) {
          this.__executeSyncAction();
        } else {
          this.__executeAsyncAction();
        }
      },

      /**
       * Performs the **synchronous** action lifecycle.
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
          this.__rejectFinal(ex);
        }

        this.__executePhaseFinally();
      },

      /**
       * Performs the **asynchronous** action lifecycle.
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
                  ["catch"](this.__rejectFinal.bind(this));
            }
          }
        } catch(ex) {
          this.__rejectFinal(ex);
        }

        (promiseFinished || Promise.resolve()).then(this.__executePhaseFinally.bind(this));
      },

      /**
       * Rejects the action with a given reason.
       *
       * An error is thrown when the given reason constitutes a cancellation and only failures are
       * allowed in the current state.
       *
       * @param {string|Error} [reason] - The reason for the rejection.
       *
       * @throws {pentaho.lang.OperationInvalidError} When canceling and the action is not in one of the states
       * [init]{@link pentaho.type.action.States.init} or [will]{@link pentaho.type.action.States.will}.
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
            throw new ArgumentInvalidTypeError("reason", ["string", "Error"], typeof reason);
          }
        } else {
          reason = null;
        }

        // Cancellation cannot be used when in the "do" state.
        if(!isFail) this.__assertStates(cancelableStates);

        this.__state = isFail ? States.failed : States.canceled;
        this.__error = reason;

        // J.I.C of an error that occurs after being done. Note the above `cancelableStates` assertion still holds,
        // asserting we don't try to cancel after `done` by throwing a cancellation UserError, for example.
        // Only failing is possible after `done`.
        this.__result = undefined;
      },

      /**
       * Rejects the action with a given reason and,
       * if that fails due to a cancellation not currently being a valid operation,
       * fails the action.
       *
       * @param {string|Error} [reason] - The reason for the rejection.
       *
       * @private
       */
      __rejectFinal: function(reason) {
        try {
          this.__reject(reason);
        } catch(ex) {
          // Reason was a cancellation, which is invalid during do. Only failure, allowed.
          this.__reject(ex);
        }
      },

      // region Private __executePhase* Methods
      /**
       * Executes the **init** phase.
       *
       * Changes the state to [init]{@link pentaho.type.action.States.init}
       * and delegates to [_onPhaseInit]{@link pentaho.type.action.Base#_onPhaseInit}.
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
       * and delegates to [_onPhaseWill]{@link pentaho.type.action.Base#_onPhaseWill}.
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
       * and delegates to [_onPhaseDo]{@link pentaho.type.action.Base#_onPhaseDo},
       * after which, in case the action is still executing,
       * calls the [_doDefault]{@link pentaho.type.action.Base#_doDefault} method.
       *
       * Used by both the synchronous and the asynchronous actions.
       *
       * @return {?Promise} A promise to the completion of an asynchronous _do_ phase or `null`.
       *
       * @private
       */
      __executePhaseDo: function() {

        this.__state = States["do"];

        var promise = this._onPhaseDo();

        var isSync = this.$type.isSync;
        if(isSync) {
          maybeDoDefault.call(this);
          return null;
        }

        return (promise || Promise.resolve()).then(maybeDoDefault.bind(this));

        function maybeDoDefault() {
          return this.isExecuting ? this._doDefault() : null;
        }
      },

      /**
       * Executes the **finally** phase.
       *
       * If the action is still executing, calls [done]{@link pentaho.type.action.Base#done},
       * with an `undefined` result.
       *
       * Delegates to [_onPhaseFinally]{@link pentaho.type.action.Base#_onPhaseFinally}.
       * Any error thrown by it is simply caught and logged.
       *
       * Finally, the [executor]{@link pentaho.type.action.Base#_executor} object, if any, is released
       * and the action [promise]{@link pentaho.type.action.Base#promise}, if previously requested,
       * is resolved.
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

        // Release the executor.
        this.__executor = null;

        // Settle the promise, if there is one.
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
       * Called during the action's **initialize** phase.
       *
       * The default implementation calls the executor's
       * [init]{@link pentaho.type.action.IObserver#init} listener, if any.
       *
       * @protected
       */
      _onPhaseInit: function() {
        var exec;
        if((exec = this.__executor) && exec.init) {
          exec.init(this);
        }
      },

      /**
       * Called during the action's _will_ phase.
       *
       * The default implementation calls the executor's
       * [will]{@link pentaho.type.action.IObserver#will} listener, if any.
       *
       * @protected
       */
      _onPhaseWill: function() {
        var exec;
        if((exec = this.__executor) && exec.will) {
          exec.will(this);
        }
      },

      /**
       * Called during the action's **do** phase.
       *
       * The default implementation calls the executor's
       * [do]{@link pentaho.type.action.IObserver#do} listener, if any.
       *
       * @return {?Promise} A promise to the completion of the asynchronous `do` listener,
       * of an [asynchronous]{@link pentaho.type.action.Base.Type#isSync} action, or `null`.
       *
       * @protected
       */
      _onPhaseDo: function() {
        var exec;
        if((exec = this.__executor) && exec["do"]) {
          return exec["do"](this);
        }
      },

      /**
       * Called during the action's **finally** phase.
       *
       * The default implementation calls the executor's
       * [finally]{@link pentaho.type.action.IObserver#finally} listener, if any.
       *
       * @protected
       */
      _onPhaseFinally: function() {
        var exec;
        if((exec = this.__executor) && exec["finally"]) {
          exec["finally"](this);
        }
      },
      // endregion
      // endregion

      // region serialization
      /** @inheritDoc */
      toSpecInContext: function(keyArgs) {

        keyArgs = keyArgs ? Object.create(keyArgs) : {};

        var spec = {};

        var declaredType;
        var includeType = !!keyArgs.forceType ||
              (!!(declaredType = keyArgs.declaredType) && this.$type !== declaredType);

        if(includeType) spec._ = this.$type.toRefInContext(keyArgs);
        if(this.label) spec.label = this.label;
        if(this.description) spec.description = this.description;

        // Don't think there is a point in serializing state, error, result, etc.
        // Some wouldn't be serializable. Others would be ignored at construction.
        // So only serializing what defines what a new action would do.

        return spec;
      }
      // endregion
    });

    actionType = Action.type;

    return Action;
  }];

  function __nonEmptyString(value) {
    return value == null ? null : (String(value) || null);
  }
});
