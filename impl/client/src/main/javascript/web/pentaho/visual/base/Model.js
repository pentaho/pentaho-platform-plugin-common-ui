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
  "pentaho/module!_",
  "./AbstractModel",
  "./KeyTypes",
  "pentaho/action/impl/Target",
  "pentaho/type/action/Transaction",
  "../action/Update",
  "../action/UpdateExecution",
  "../action/Interaction",
  "../action/InteractionExecution",
  "../action/Select",
  "../action/SelectExecution",
  "../action/Execute",
  "pentaho/util/text",
  "pentaho/util/error",
  "pentaho/util/logger",
  "pentaho/i18n!model",
  "../role/Property" // Pre-loaded with Model
], function(module, AbstractModel, KeyTypes, ActionTargetMixin, Transaction, UpdateAction, UpdateExecution,
            Interaction, InteractionExecution, SelectAction, SelectExecution, ExecuteAction,
            textUtil, errorUtil, logger, bundle) {

  "use strict";

  /* eslint max-len:0 */

  // region Custom Action Executions
  /**
   * @classDesc A class which serves to mark that update actions should behave like if full changes have occurred.
   * In practice, values of this type never leave this module, being replaced by a `null` changeset in the actual
   * update action.
   *
   * @name pentaho.visual.action.FullChangeset
   * @class
   * @extends pentaho.type.action.Changeset
   * @private
   */

  /**
   * The full changeset instance.
   *
   * @type {pentaho.visual.action.FullChangeset}
   * @private
   * @const
   */
  var __fullChangeset = {};

  /**
   * An `UpdateControl` contains all things needed to control the execution of multiple update actions
   * from the Model's point-of-view.
   *
   * The `current` property is always non-null and contains the update action execution which is currently executing.
   * The `next` property is initially null and is created the first time that
   * `update()` is called, after new changes occur, and while a current execution is ongoing.
   * When the current execution ends, it checks to see if there is a next and, if so, makes it current.
   *
   * @typedef {({current: pentaho.visual.action.UpdateExecutionControl, next: ?pentaho.visual.action.UpdateExecutionControl})} pentaho.visual.action.UpdateControl
   *
   * @private
   */

  /**
   * An `UpdateExecutionControl` contains all things needed to control an action execution from the Model's point-of-view.
   *
   * @typedef {({promise: Promise, resolve: function, reject: function, execution: ?pentaho.visual.action.UpdateExecution})} pentaho.visual.action.UpdateExecutionControl
   *
   * @private
   */

  /**
   * Creates an execution control.
   *
   * @return {pentaho.visual.action.UpdateExecutionControl} The execution control.
   */
  function __createUpdateExecutionControl() {
    var resolve = null;
    var reject = null;
    var promise = new Promise(function(_resolve, _reject) {
      resolve = _resolve;
      reject = _reject;
    });

    return {promise: promise, resolve: resolve, reject: reject, execution: null};
  }
  // endregion

  /**
   * @name pentaho.visual.base.ModelType
   * @class
   * @extends pentaho.visual.base.AbstractModelType
   *
   * @classDesc The base class of visual model types.
   *
   * For more information see {@link pentaho.visual.base.Model}.
   */

  /**
   * @name Model
   * @memberOf pentaho.visual.base
   * @class
   * @extends pentaho.visual.base.AbstractModel
   * @extends pentaho.action.impl.Target
   * @abstract
   *
   * @amd pentaho/visual/base/Model
   *
   * @classDesc The `Model` class is the required, base class of visualization models.
   *
   * All registered visual filter types are pre-loaded with the model classes and
   * can thus be safely loaded synchronously.
   *
   * @constructor
   * @description Creates a model instance, given its specification.
   * @param {pentaho.visual.base.spec.IModel} [modelSpec] The model specification.
   *
   * @see pentaho.visual.base.IView
   * @see pentaho.visual.action.Select
   * @see pentaho.visual.action.Execute
   * @see pentaho.visual.action.Update
   */
  return AbstractModel.extend(/** @lends pentaho.visual.base.Model# */{

    constructor: function(modelSpec) {

      this.base(modelSpec);

      this._init(modelSpec);
    },

    /**
     * Called when the model is constructed.
     *
     * Override this method, from a subclass or configuration mixin class,
     * to perform the initialization of a model instance.
     * In principle, you should call the base implementation before settings any properties in `this`.
     *
     * @param {pentaho.visual.base.spec.IModel} modelSpec - The model specification provided at construction time,
     * if any.
     * @protected
     */
    _init: function(modelSpec) {

      var isAutoUpdate = modelSpec && modelSpec.isAutoUpdate;

      /**
       * Indicates if the model is automatically updated whenever changes occur.
       *
       * @type {boolean}
       * @default true
       * @private
       */
      this.__isAutoUpdate = isAutoUpdate == null || Boolean(isAutoUpdate);

      /**
       * The current, accumulated changeset.
       *
       * Initially, models are considered fully changed,
       * and so a first explicit update is pending.
       *
       * @type {?pentaho.type.action.Changeset}
       * @readOnly
       * @private
       */
      this.__changeset = __fullChangeset;

      /**
       * The model $version when `__changeset` was updated for the last time.
       *
       * @type {number}
       * @private
       */
      this.__dirtyLastVersion = this.$version;

      /**
       * An object that supports the control of the update operation.
       *
       * @type {?pentaho.visual.action.UpdateControl}
       * @private
       */
      this.__updateControl = null;
    },

    // region CHANGES
    /**
     * Gets a value that indicates if automatic updates are enabled.
     *
     * When `true`, the model is automatically updated whenever changes occur.
     * The model is updated before notifying any local listeners of
     * the [Change:{finally}]{@link pentaho.type.action.Change} action.
     *
     * When `false`, the model must be manually updated by calling the
     * [update]{@link pentaho.visual.base.Model#update} method.
     *
     * @type {boolean}
     * @readOnly
     */
    get isAutoUpdate() {
      return this.__isAutoUpdate;
    },

    /**
     * Gets a value that indicates if the model is in a dirty state.
     *
     * A model is considered _dirty_ from the time it is changed to the time it is updated.
     * This includes the entirety of the update execution.
     * Contrast this with the [isDirtyNew]{@link pentaho.visual.base.Model#isDirtyNew} property,
     * which excludes the period of the current update execution.
     *
     * During the _dirty_ period,
     * the model **should not** handle any user interaction actions,
     * as the user could be acting on an outdated representation of it.
     *
     * @type {boolean}
     * @readOnly
     *
     * @see pentaho.visual.base.Model#isDirtyNew
     * @see pentaho.visual.base.Model#isUpdating
     */
    get isDirty() {
      // Because changesets are cleared optimistically before update occurs,
      // it is needed to use isUpdating to not let that transient non-dirty state show through.
      return this.isUpdating || this.isDirtyNew;
    },

    /**
     * Gets a value that indicates if the model has been changed since the last update execution started.
     *
     * A model is dirty if changes exist which were not captured by a past or ongoing update execution.
     *
     * This property yields the correct result even if called before the local
     * [_onChangeFinally]{@link pentaho.visual.base.Model#_onChangeFinally} handler,
     * during a transaction.
     *
     * Contrast this property with the [isDirty]{@link pentaho.visual.base.Model#isDirty} property,
     * which takes into account whether the view is [updating]{@link pentaho.visual.base.Model#isUpdating},
     * while this property does not.
     *
     * @type {boolean}
     * @readOnly
     * @see pentaho.visual.base.Model#isDirty
     * @see pentaho.visual.base.Model#isUpdating
     */
    get isDirtyNew() {
      var changeset = this.__changeset;
      if(changeset === __fullChangeset) {
        this.__dirtyLastVersion = this.$version;
      } else {
        var changesetsPending = Transaction.getChangesetsPending(this);
        if(changesetsPending !== null) {
          var L = changesetsPending.length;
          var i = -1;
          while(++i < L) {
            var changesetPending = changesetsPending[i];
            if(changesetPending.targetVersion >= this.__dirtyLastVersion) {

              this.__changeset = changeset = __combineChangesets(changeset, changesetPending);
              this.__dirtyLastVersion = changesetPending.targetVersion + 1;
            }
          }

          // assert this.__dirtyLastVersion === this.$version;
        }
      }

      return changeset !== null;
    },

    /**
     * Emits the `finally` phase event of a change action execution.
     *
     * The default implementation proceeds like:
     *
     * 1. When the change action is [successful]{@link pentaho.action.Execution#isDone}
     *    the change is acknowledged, by affecting the [isDirty]{@link pentaho.visual.base.Model#isDirty}.
     * 2. When the change action is successful and [isAutoUpdate]{@link pentaho.visual.base.Model#isAutoUpdate}
     *    is `true`, calls the [_onAutoUpdate]{@link pentaho.visual.base.Model#_onAutoUpdate} method.
     * 3. Delegates to the base implementation, which handles emitting the `finally` phase event.
     *
     * @param {pentaho.type.action.Transaction} transaction - The action execution.
     *
     * @override
     */
    _onChangeFinally: function(transaction) {

      if(transaction.isDone) {
        if(this.isAutoUpdate) {
          this._onAutoUpdate();
        } else {
          // Capture change.
          /* eslint-disable-next-line no-unused-expressions */
          this.isDirtyNew;
        }
      }

      // Emit event.

      this.base(transaction);
    },

    /**
     * Called when a change is made and `isAutoUpdate` is `true`.
     *
     * The default implementation calls the [update]{@link pentaho.visual.base.Model#update} method,
     * taking care to log a warning, when it is rejected.
     *
     * @protected
     *
     * @see pentaho.visual.base.Model#_onChangeFinally
     */
    _onAutoUpdate: function() {

      /* eslint dot-notation: 0 */

      this.update()["catch"](function(error) {
        logger.warn("Auto-update was rejected: " + error);
      });
    },
    // endregion

    // region Action UPDATE
    /**
     * Gets a value that indicates if an _update_ execution is in progress.
     *
     * @type {boolean}
     * @readOnly
     *
     * @see pentaho.visual.base.Model#update
     */
    get isUpdating() {
      return this.__updateControl !== null;
    },

    /**
     * Updates the model to match the latest changes.
     *
     * Models are created in a [dirty]{@link pentaho.visual.base.Mode#isDirty} state.
     * An initial call to this method is necessary to update any views for the first time.
     *
     * However, when [isAutoUpdate]{@link pentaho.visual.base.Model#isAutoUpdate} is `true`,
     * any changes to the model cause this method to be called automatically.
     *
     * The update action is asynchronous. This is true even if all listeners handle the update synchronously.
     * Action completion is only ever advertised asynchronously, through
     * the emission of the action execution's `finally` phase event and
     * then by the resolution of the returned promise.
     *
     * When this method is called, the model may be in four different states,
     * depending on the current values of the properties
     * [isDirtyNew]{@link pentaho.visual.base.Model#isDirtyNew} and
     * [isUpdating]{@link pentaho.visual.base.Model#isUpdating}:
     *
     * 1. The model is _not dirty_ and is _not updating_: a resolved promise is returned.
     * 2. The model is _not dirty_, yet is still _updating_: a promise for the completion of the current update
     *    is returned.
     * 3. The model is _dirty_ and is _not updating_: an [Update]{@link pentaho.visual.action.Update} action is created
     *    and its execution started; a promise for its completion is returned.
     * 4. The model is _dirty again_ and is still _updating_: an update execution for previous changes is still underway;
     *    a following update execution is scheduled to start upon the completion of the current execution,
     *    independently of its outcome, and which will consider any changes which are registered until it starts;
     *    a promise for the completion of this following update execution is returned;
     *    if a following update execution had already been scheduled, it is reused.
     *
     * The [isUpdating]{@link pentaho.visual.base.Model#isUpdating} property is `true` during all of the phases of
     * the update execution: `init`, `will`, `do` and `finally`.
     *
     * Listeners of the `Update` action receive an action execution of type
     * [UpdateExecution]{@link pentaho.visual.action.UpdateExecution}.
     * This class exposes the [assertModelUnchanged]{@link pentaho.visual.action.UpdateExecution#assertModelUnchanged}
     * method, which is useful for asynchronous update executions to check if the model has changed since their start.
     *
     * Some well-known causes for an update action to be rejected are standardized and included in the
     * [WellKnownErrorNames]{@link pentaho.visual.action.WellKnownErrorNames} enumeration.
     *
     * @return {Promise} A promise for the completion of an update execution which includes the current changes, if any.
     *
     * @fires "pentaho/visual/action/Update:{init}"
     * @fires "pentaho/visual/action/Update:{will}"
     * @fires "pentaho/visual/action/Update:{do}"
     * @fires "pentaho/visual/action/Update:{finally}"
     *
     * @see pentaho.visual.action.Update
     * @see pentaho.visual.action.UpdateExecution
     * @see pentaho.visual.base.Model#isAutoUpdate
     * @see pentaho.visual.base.Model#isDirtyNew
     * @see pentaho.visual.base.Model#isDirty
     * @see pentaho.visual.base.Model#isUpdating
     * @see pentaho.visual.action.WellKnownErrorNames
     */
    update: function() {

      var updateControl = this.__updateControl;

      // No new changes?
      if(!this.isDirtyNew) {
        // Update executing?
        return updateControl !== null ? updateControl.current.promise : Promise.resolve();
      }

      // New changes.

      // No update executing?
      if(updateControl === null) {

        // Start a new current.
        // Bind a priori.
        this.__updateControl = updateControl = {
          current: __createUpdateExecutionControl(),
          next: null
        };

        this.__updateBegin();

        return updateControl.current.promise;
      }

      // Update executing.
      // assert updateControl.current !== null

      // No next update created?
      if(updateControl.next === null) {
        updateControl.next = __createUpdateExecutionControl();
      }

      return updateControl.next.promise;
    },

    /**
     * Starts a new update execution.
     *
     * An accumulated changeset must exist.
     *
     * @private
     */
    __updateBegin: function() {

      // Consume the current changeset
      var changeset = this.__changeset;
      this.__changeset = null;
      // assert changeset !== null

      // Don't let the marker go out.
      if(changeset === __fullChangeset) {
        changeset = null;
      }

      var actionExecution = this.act(new UpdateAction({changeset: changeset}));

      this.__updateControl.current.execution = actionExecution;

      actionExecution.promise
        .then(this.__updateResolved.bind(this), this.__updateRejected.bind(this));
    },

    /**
     * Handles the success of an update execution.
     *
     * If there is a pending _next_ update,
     * a new update execution is started.
     *
     * @private
     */
    __updateResolved: function() {

      // assert this.__updateControl.current !== null

      // Notify all _current_ listeners.
      // * if no additional changes exist or are now made, and update is called (or is auto),
      //   the same promise, now being resolved, is received.
      // * if additional changes exist or are now made, and update is called (or is auto),
      //   the next promise is received. Any changes still accumulate for the _next_ update,
      //   which is about to start
      this.__updateControl.current.resolve();

      this.__updateNext();
    },

    /**
     * Handles the rejection of an update execution.
     *
     * @param {Error} error - The rejection error.
     * @private
     */
    __updateRejected: function(error) {

      var updateControl = this.__updateControl;
      // assert updateControl.current !== null

      // Reuse the execution's classification of the error.
      var actionExecution = updateControl.current.execution;

      if(actionExecution.isFailed) {
        // Action failure.

        // Internal state may be inconsistent, so force a full update.
        this.__changeset = __fullChangeset;
      } else {
        // Action cancellation.

        // Restore previous changeset, combining it with any new existing changeset.
        // Assume nothing was done (or was but can safely be retried).
        // Take care to reintroduce the full changeset marker.
        var changeset = actionExecution.action.changeset || __fullChangeset;

        this.__changeset = __combineChangesets(changeset, this.__changeset);
      }

      // Notify all _current_ listeners.
      // * if no additional changes exist or are now made, and update is called (or is auto),
      //   the same promise, now being rejected, is received.
      // * if additional changes exist or are now made, and update is called (or is auto),
      //   the next promise is received. Any changes still accumulate for the _next_ update,
      //   which is about to start.
      updateControl.current.reject(error);

      this.__updateNext();
    },

    /**
     * Checks whether there is a next execution scheduled and starts it if so.
     * Otherwise, finishes the update loop.
     *
     * @private
     */
    __updateNext: function() {

      var updateControl = this.__updateControl;

      // Start NEXT update, if any.
      var next = updateControl.next;
      if(next !== null) {
        // Defer, so that promise-listeners of previous execution are notified before
        // the event listeners of the _next_ execution.
        Promise.resolve().then(function() {
          // Shift next to current.
          updateControl.next = null;
          updateControl.current = next;

          this.__updateBegin();
        }.bind(this));
      } else {
        // Finish this update loop.
        this.__updateControl = null;
      }
    },
    // endregion

    /**
     * Performs a _select_ action, given its specification.
     *
     * A _select_ action can only be performed if the model is not [dirty]{@link pentaho.visual.base.Model#isDirty}.
     *
     * @param {pentaho.visual.action.Select|pentaho.visual.action.spec.ISelect} [actionOrSpec] - The _select_ action
     * or its specification.
     *
     * @return {pentaho.action.Execution} The action execution.
     *
     * @see pentaho.visual.action.Select
     */
    select: function(actionOrSpec) {
      var action = actionOrSpec instanceof SelectAction ? actionOrSpec : new SelectAction(actionOrSpec);
      return this.act(action);
    },

    /**
     * Performs an _execute_ action, given its specification.
     *
     * An _execute_ action can only be performed if the model is not [dirty]{@link pentaho.visual.base.Model#isDirty}.
     *
     * @param {pentaho.visual.action.Execute|pentaho.visual.action.spec.IExecute} [actionOrSpec] - The _execute_ action
     * or its specification.
     *
     * @return {pentaho.action.Execution} The action execution.
     *
     * @see pentaho.visual.action.Execute
     */
    execute: function(actionOrSpec) {
      var action = actionOrSpec instanceof ExecuteAction ? actionOrSpec : new ExecuteAction(actionOrSpec);
      return this.act(action);
    },

    $type: /** @lends pentaho.visual.base.ModelType# */{
      id: module.id,
      defaultView: "./View",
      isAbstract: true,

      props: [
        /**
         * Gets or sets the width that the container application has allocated to display the visualization
         * without horizontal or vertical scrolling, in pixels.
         *
         * This property is required.
         *
         * @name width
         * @memberOf pentaho.visual.base.Model#
         * @type {number}
         * @default 300
         *
         * @see pentaho.visual.base.Model#height
         */
        {
          name: "width",
          valueType: "number",
          isRequired: true,
          defaultValue: 300
        },
        /**
         * Gets or sets the height that the container application has allocated to display the visualization
         * without horizontal or vertical scrolling, in pixels.
         *
         * This property is required.
         *
         * @name height
         * @memberOf pentaho.visual.base.Model#
         * @type {number}
         * @default 300
         *
         * @see pentaho.visual.base.Model#width
         */
        {
          name: "height",
          valueType: "number",
          isRequired: true,
          defaultValue: 300
        }
      ],

      /** @inheritDoc */
      _init: function(spec, keyArgs) {

        spec = this.base(spec, keyArgs) || spec;

        this.__setVisualKeyType(spec.visualKeyType);

        return spec;
      },

      // region visualKeyType
      __visualKeyType: undefined,

      /** @inheritDoc */
      get visualKeyType() {
        return this.__visualKeyType;
      },

      /**
       * Sets the value of visual key type.
       *
       * If the value is {@link Nully} or an empty string, it is ignored,
       * unless this type is not [isAbstract]{@link pentaho.type.Type#isAbstract},
       * in which case the default value of [dataKey]{@link }pentaho.visual.base.KeyTypes.dataKey} is assumed.
       *
       * @param {?pentaho.visual.base.KeyTypes|undefined} value - The new visual key type, if any.
       *
       * @throw {pentaho.lang.ArgumentRangeError} When the visual key type value is not one of the possible values.
       * @throw {pentaho.lang.OperationInvalidError} When the visual key type value is already set and the specified
       * value is different.
       *
       * @private
       */
      __setVisualKeyType: function(value) {

        value = textUtil.nonEmptyString(value);

        var visualKeyType = this.__visualKeyType;
        if(visualKeyType === undefined) {

          if(value === null) {

            if(this.isAbstract) {
              return;
            }

            value = KeyTypes.dataKey;

          } else if(!KeyTypes.hasOwnProperty(value)) {

            throw errorUtil.argRange("visualKeyType");
          }

          this.__visualKeyType = value;
          return;
        }

        if(value !== null && visualKeyType !== value) {

          // Would change value...
          throw errorUtil.operInvalid("Once defined, 'visualKeyType' cannot be changed.");
        }
      }
      // endregion
    }
  })
  .mix(ActionTargetMixin)
  .implement(/** @lends pentaho.visual.base.Model# */{

    // region ITarget implementation
    /** @inheritDoc */
    _createActionExecution: function(action) {

      if(action instanceof UpdateAction) {
        return new UpdateExecution(action, this);
      }

      if(action instanceof SelectAction) {
        return new SelectExecution(action, this);
      }

      if(action instanceof Interaction) {
        return new InteractionExecution(action, this);
      }

      return this.base(action);
    }
    // endregion
  })
  .localize({$type: bundle.structured.Model})
  .configure({$type: module.config});

  /**
   * Creates a new changeset which combines two given changesets.
   *
   * A full changeset combined with any other changeset remains a full changeset.
   *
   * @param {?pentaho.type.action.ComplexChangeset|pentaho.visual.action.FullChangeset} changeset1 - The first
   * changeset.
   * @param {?pentaho.type.action.ComplexChangeset|pentaho.visual.action.FullChangeset} changeset2 - The second
   * changeset.
   *
   * @return {?pentaho.type.action.ComplexChangeset|pentaho.visual.action.FullChangeset} The combined changeset.
   */
  function __combineChangesets(changeset1, changeset2) {
    if(changeset1 != null && changeset2 != null) {
      if(changeset1 === __fullChangeset) {
        return __fullChangeset;
      }

      if(changeset2 === __fullChangeset) {
        return __fullChangeset;
      }

      // TODO
      return changeset1;
    }

    return changeset1 || changeset2;
  }
});
