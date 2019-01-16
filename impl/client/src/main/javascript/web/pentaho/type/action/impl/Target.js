/*!
 * Copyright 2017 - 2018 Hitachi Vantara. All rights reserved.
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
  "../Base",
  "../Execution",
  "pentaho/util/error"
], function(module, EventSource, ActionBase, ActionExecution, error) {

  "use strict";

  /**
   * @classDesc The `GenericActionExecution` class is an inner class of
   * [Target]{@link pentaho.type.action.impl.Target} that assumes that
   * that the execution [target]{@link pentaho.type.action.Execution#target}
   * is a `Target`.
   *
   * It provides a generic implementation of [Execution]{@link pentaho.type.action#Execution}
   * which delegates to the event observers of each of the execution phases,
   * by calling the correspondingly named methods of target:
   * [Target#_emitActionPhaseInitEvent]{@link pentaho.type.action.impl.Target#_emitActionPhaseInitEvent},
   * [Target#_emitActionPhaseWillEvent]{@link pentaho.type.action.impl.Target#_emitActionPhaseWillEvent}
   * [Target#_emitActionPhaseDoEvent]{@link pentaho.type.action.impl.Target#_emitActionPhaseDoEvent} and
   * [Target#_emitActionPhaseFinallyEvent]{@link pentaho.type.action.impl.Target#_emitActionPhaseFinallyEvent}.
   *
   * @class
   * @memberOf pentaho.type.action.impl.Target
   * @extends pentaho.type.action.Execution
   */
  var GenericActionExecution = ActionExecution.extend({
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

  // var __actionBaseType = ActionBase.type;

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
    errorHandler: function(ex, actionExecution) {
      actionExecution.fail(ex);
    },
    isCanceled: function(actionExecution) {
      return actionExecution.isCanceled;
    }
  };

  /**
   * @classDesc The `Target` class is a mixin class that builds upon
   * [EventSource]{@link pentaho.lang.EventSource} to implement the
   * [ITarget]{@link pentaho.type.action.ITarget} interface.
   *
   * It provides a generic action [Execution]{@link pentaho.type.action.Execution}
   * implementation which delegates to the event observers of each of the execution phases.
   *
   * The event observers have the following signature:
   * ```js
   * function(event, action) {
   *
   *   // assert event instanceof pentaho.type.action.Execution;
   *
   *   // assert action === event.action;
   *   // assert action instanceof pentaho.type.action.Base;
   *
   *   // assert this === event.target;
   *   // assert this instanceof pentaho.type.action.ITarget;
   * }
   * ```
   *
   * The `do` phase event observer can return a {@link Promise}.
   *
   * @name pentaho.type.action.impl.Target
   * @class
   *
   * @extends pentaho.lang.EventSource
   *
   * @implements {pentaho.type.action.ITarget}
   *
   * @abstract
   *
   * @amd pentaho/type/action/impl/Target
   *
   * @description This class was not designed to be constructed directly.
   * It was designed to be used as a **mixin**.
   *
   * @constructor
   */

  return EventSource.extend(module.id, /** @lends pentaho.type.action.impl.Target# */{

    /** @inheritDoc */
    act: function(action) {

      if(!action) throw error.argRequired("action");

      // action = __actionBaseType.to(action);

      return this._createActionExecution(action).execute();
    },

    /**
     * Creates an action execution for a given action.
     *
     * The default implementation delegates to
     * [_createGenericActionExecution]{pentaho.type.action.impl.Target#_createGenericActionExecution}.
     *
     * @param {pentaho.type.action.Base} action - The action which will be executed.
     *
     * @return {pentaho.type.action.Execution} The action execution.
     *
     * @protected
     *
     * @see pentaho.type.action.ITarget#act
     */
    _createActionExecution: function(action) {
      return this._createGenericActionExecution(action);
    },

    /**
     * Creates a generic action execution for a given action.
     *
     * The implementation returns an instance of
     * [Target.GenericActionExecution]{@link pentaho.type.action.impl.Target.GenericActionExecution}.
     *
     * @param {pentaho.type.action.Base} action - The action which will be executed.
     *
     * @return {pentaho.type.action.Execution} The action execution.
     *
     * @protected
     */
    _createGenericActionExecution: function(action) {
      return new GenericActionExecution(action, this);
    },
    // endregion

    // region Actions
    /**
     * Emits the `init` phase event of an action execution.
     *
     * The default implementation delegates to
     * [_emitGeneric]{@link pentaho.lang.EventSource#_emitGeneric}.
     *
     * @param {pentaho.type.action.Execution} actionExecution - The action execution.
     *
     * @protected
     */
    _emitActionPhaseInitEvent: function(actionExecution) {

      var action = actionExecution.action;
      var eventType = action.type;

      this._emitGeneric(this, [actionExecution, action], eventType, "init", __emitActionKeyArgs);
    },

    /**
     * Emits the `will` phase event of an action execution.
     *
     * The default implementation delegates to
     * [_emitGeneric]{@link pentaho.lang.EventSource#_emitGeneric}.
     *
     * @param {pentaho.type.action.Execution} actionExecution - The action execution.
     *
     * @protected
     */
    _emitActionPhaseWillEvent: function(actionExecution) {

      var action = actionExecution.action;
      var eventType = action.type;

      this._emitGeneric(this, [actionExecution, action], eventType, "will", __emitActionKeyArgs);
    },

    /**
     * Emits the `do` phase event of an action execution.
     *
     * The default implementation delegates to
     * [_emitGenericAllAsync]{@link pentaho.lang.EventSource#_emitGenericAllAsync},
     * when the action is [asynchronous]{@link pentaho.type.action.BaseType#isSync}.
     * Delegates to
     * [_emitGeneric]{@link pentaho.lang.EventSource#_emitGeneric}, otherwise.
     *
     * @param {pentaho.type.action.Execution} actionExecution - The action execution.
     *
     * @return {?Promise} A promise to the completion of the asynchronous `do` listener,
     * of an [asynchronous]{@link pentaho.type.action.BaseType#isSync} action, or `null`.
     *
     * @protected
     */
    _emitActionPhaseDoEvent: function(actionExecution) {

      var action = actionExecution.action;
      var isActionSync = action.constructor.isSync;
      var eventType = action.type;

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
     * @param {pentaho.type.action.Execution} actionExecution - The action execution.
     *
     * @protected
     */
    _emitActionPhaseFinallyEvent: function(actionExecution) {

      var action = actionExecution.action;
      var eventType = action.type;

      this._emitGeneric(this, [actionExecution, action], eventType, "finally");
    }
  }, {
    GenericActionExecution: GenericActionExecution
  });
});
