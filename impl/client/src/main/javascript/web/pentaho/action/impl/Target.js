/*!
 * Copyright 2017 - 2019 Hitachi Vantara. All rights reserved.
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
  "pentaho/lang/EventSource",
  "../Execution",
  "pentaho/lang/ArgumentRequiredError",
  "pentaho/util/error"
], function(module, EventSource, ActionExecution, ArgumentRequiredError, error) {

  "use strict";

  /**
   * @classDesc The `Target.ActionExecution` class is an inner class of
   * [Target]{@link pentaho.action.impl.Target} that assumes that
   * that the execution [target]{@link pentaho.action.Execution#target}
   * is a `Target`.
   *
   * It provides an implementation of [Execution]{@link pentaho.action#Execution}
   * which delegates to the event observers of each of the execution phases,
   * by calling the correspondingly named methods of target:
   * [Target#_emitActionPhaseInitEvent]{@link pentaho.action.impl.Target#_emitActionPhaseInitEvent},
   * [Target#_emitActionPhaseWillEvent]{@link pentaho.action.impl.Target#_emitActionPhaseWillEvent}
   * [Target#_emitActionPhaseDoEvent]{@link pentaho.action.impl.Target#_emitActionPhaseDoEvent} and
   * [Target#_emitActionPhaseFinallyEvent]{@link pentaho.action.impl.Target#_emitActionPhaseFinallyEvent}.
   *
   * @class
   * @alias ActionExecution
   * @memberOf pentaho.action.impl.Target
   * @extends pentaho.action.Execution
   *
   * @description Creates an action execution instance for a given action and target.
   *
   * @constructor
   * @param {pentaho.type.action.Base} action - The action to execute. A clone of it is used.
   * @param {pentaho.type.action.ITarget} target - The target on which to execute.
   */
  var TargetActionExecution = ActionExecution.extend({
    constructor: function(action, target) {

      this.base();

      if(!action) throw new ArgumentRequiredError("action");
      if(!target) throw new ArgumentRequiredError("target");

      // Clone action so that it can be safely frozen and
      // still allow the original action to be re-executed.
      /**
       * The action of the action execution.
       *
       * @type {pentaho.type.action.Base}
       * @private
       */
      this.__action = action.clone();

      /**
       * The target of the action execution.
       *
       * @type {pentaho.type.action.ITarget}
       * @private
       */
      this.__target = target;
    },

    /** @inheritDoc */
    get action() {
      return this.__action;
    },

    /** @inheritDoc */
    get target() {
      return this.__target;
    },

    // @override
    _onPhaseInit: function() {
      this.target._emitActionPhaseInitEvent(this);
    },

    // @override
    _onPhaseWill: function() {
      this.target._emitActionPhaseWillEvent(this);
    },

    // @override
    _onPhaseDo: function() {
      return this.target._emitActionPhaseDoEvent(this);
    },

    // @override
    _onPhaseFinally: function() {
      this.target._emitActionPhaseFinallyEvent(this);
    }
  });

  /**
   * The `_emitGeneric` keyword arguments used for all phases but the finally phase.
   *
   * In the early phases:
   * - cancellation is possible;
   * - arbitrary errors cause the action to fail.
   *
   * In the finally phase:
   * - it is not possible to cancel;
   * - errors are swallowed and logged and do not affect the action execution's result;
   *   the default error handler does this.
   */
  var __emitActionKeyArgs = {
    errorHandler: function(ex, eventArgs) {
      var actionExecution = eventArgs[0];
      actionExecution.reject(ex);
    },
    isCanceled: function(actionExecution) {
      return actionExecution.isCanceled;
    },
    getCancellationReason: function(actionExecution) {
      return actionExecution.error;
    }
  };

  /**
   * @classDesc The `Target` class is a mixin class that builds upon
   * [EventSource]{@link pentaho.lang.EventSource} to implement the
   * [ITarget]{@link pentaho.action.ITarget} interface.
   *
   * It provides a generic action [Execution]{@link pentaho.action.Execution}
   * implementation which delegates to the event observers of each of the execution phases.
   *
   * The event observers have the following signature:
   * ```js
   * function(event, action) {
   *
   *   // assert event instanceof pentaho.action.Execution;
   *
   *   // assert action === event.action;
   *   // assert action instanceof pentaho.action.Base;
   *
   *   // assert this === event.target;
   *   // assert this instanceof pentaho.action.ITarget;
   * }
   * ```
   *
   * The `do` phase event observer can return a {@link Promise}.
   *
   * @name pentaho.action.impl.Target
   * @class
   *
   * @extends pentaho.lang.EventSource
   *
   * @implements {pentaho.action.ITarget}
   *
   * @abstract
   *
   * @amd pentaho/action/impl/Target
   *
   * @description This class was not designed to be constructed directly.
   * It was designed to be used as a **mixin**.
   *
   * @constructor
   */

  return EventSource.extend(module.id, /** @lends pentaho.action.impl.Target# */{

    /** @inheritDoc */
    act: function(action) {

      if(!action) throw error.argRequired("action");

      return this._createActionExecution(action).execute();
    },

    /**
     * Creates an action execution for a given action.
     *
     * @param {pentaho.action.Base} action - The action which will be executed.
     *
     * @return {pentaho.action.Execution} The action execution.
     *
     * @protected
     *
     * @see pentaho.action.ITarget#act
     */
    _createActionExecution: function(action) {
      return new TargetActionExecution(action, this);
    },
    // endregion

    // region Actions
    /**
     * Emits the `init` phase event of an action execution.
     *
     * The default implementation delegates to
     * [_emitGeneric]{@link pentaho.lang.EventSource#_emitGeneric}.
     *
     * @param {pentaho.action.Execution} actionExecution - The action execution.
     *
     * @protected
     */
    _emitActionPhaseInitEvent: function(actionExecution) {

      var action = actionExecution.action;
      var eventType = action.eventName;

      this._emitGeneric(this, [actionExecution, action], eventType, "init", __emitActionKeyArgs);
    },

    /**
     * Emits the `will` phase event of an action execution.
     *
     * The default implementation delegates to
     * [_emitGeneric]{@link pentaho.lang.EventSource#_emitGeneric}.
     *
     * @param {pentaho.action.Execution} actionExecution - The action execution.
     *
     * @protected
     */
    _emitActionPhaseWillEvent: function(actionExecution) {

      var action = actionExecution.action;
      var eventType = action.eventName;

      this._emitGeneric(this, [actionExecution, action], eventType, "will", __emitActionKeyArgs);
    },

    /**
     * Emits the `do` phase event of an action execution.
     *
     * The default implementation delegates to
     * [_emitGenericAllAsync]{@link pentaho.lang.EventSource#_emitGenericAllAsync},
     * when the action is [asynchronous]{@link pentaho.action.Base.isSync}.
     * Delegates to
     * [_emitGeneric]{@link pentaho.lang.EventSource#_emitGeneric}, otherwise.
     *
     * @param {pentaho.action.Execution} actionExecution - The action execution.
     *
     * @return {?Promise} A promise to the completion of the asynchronous `do` listener,
     * of an [asynchronous]{@link pentaho.action.Base.isSync} action, or `null`.
     *
     * @protected
     */
    _emitActionPhaseDoEvent: function(actionExecution) {

      var action = actionExecution.action;
      var isActionSync = action.constructor.isSync;
      var eventType = action.eventName;

      if(isActionSync) {
        this._emitGeneric(this, [actionExecution, action], eventType, "do", __emitActionKeyArgs);

        return null;
      }

      return this._emitGenericAllAsync(this, [actionExecution, action], eventType, "do", __emitActionKeyArgs);
    },

    /**
     * Emits the `finally` phase event of an action execution.
     *
     * The default implementation delegates to
     * [_emitGeneric]{@link pentaho.lang.EventSource#_emitGeneric}.
     *
     * @param {pentaho.action.Execution} actionExecution - The action execution.
     *
     * @protected
     */
    _emitActionPhaseFinallyEvent: function(actionExecution) {

      var action = actionExecution.action;
      var eventType = action.eventName;

      this._emitGeneric(this, [actionExecution, action], eventType, "finally");
    }
  }, {
    ActionExecution: TargetActionExecution
  });
});
