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
  "pentaho/type/action/Execution",
  "pentaho/type/changes/ComplexChangeset",
  "pentaho/i18n!view",
  "pentaho/lang/UserError",
  "pentaho/util/object",
  "pentaho/util/arg",
  "pentaho/util/fun",
  "pentaho/util/BitSet",
  "pentaho/util/error",
  "pentaho/util/logger",
  "pentaho/util/promise",
  "pentaho/util/spec",

  // so that r.js sees otherwise invisible dependencies.
  "pentaho/type/complex",
  "pentaho/visual/base/model",
  "pentaho/type/action/base",
  "../action/base",
  "../action/update",
  "../action/select",
  "../action/execute",
  "../action/mixins/data",
  "../action/mixins/positioned"
], function(ActionExecution, ComplexChangeset, bundle, UserError, O, arg, F, BitSet, error, logger, promise, specUtil) {

  "use strict";

  /* globals Promise */

  var __reUpdateMethodName = /^_update(.+)$/;

  var UpdateActionExecution = ActionExecution.extend({
    // @override
    _onPhaseInit: function() {
      var view = this.target;

      if(view.__domContainer === null) {
        throw error.operInvalid("The view has no domContainer.");
      }

      if(view.__updateActionExecution !== null) {
        throw error.operInvalid("The view is already updating.");
      }

      view.__updateActionExecution = this;

      view._onUpdateInit(this);
    },

    // @override
    _onPhaseWill: function() {
      this.target._onUpdateWill(this);
    },

    // @override
    _onPhaseDo: function() {
      return this.target._onUpdateDo(this);
    },

    // @override
    _onPhaseFinally: function() {

      // assert this.__updateActionExecution === updateActionExecution;
      var view = this.target;

      view.__updateActionExecution = null;

      if(this.isDone) {
        // J.I.C.
        view.__dirtyPropGroups.clear();
      }

      view._onUpdateFinally(this);
    }
  });

  return [
    "pentaho/type/complex",
    "pentaho/visual/base/model",
    "pentaho/type/action/impl/target",
    "../action/update",
    "../action/select",

    // Pre-load all registered visual action types so that it is safe to request them synchronously.
    {$types: {base: "pentaho/visual/action/base"}},

    function(Complex, VisualModel, TargetMixin, UpdateAction, SelectAction) {

      var context = this;

      /**
       * @name SelectExecution
       * @memberOf pentaho.visual.action
       * @class
       * @extends pentaho.type.action.Execution
       * @private
       *
       * @classDesc The execution class for a
       * [Select]{@link pentaho.visual.action.Select} action in a
       * [View]{@link pentaho.visual.base.View}.
       *
       * @description Creates a select action execution instance for a given select action and view.
       *
       * @constructor
       * @param {!pentaho.visual.action.Select} action - The select action.
       * @param {!pentaho.visual.base.View} view - The target view.
       */
      var SelectActionExecution = TargetMixin.GenericActionExecution.extend({
        /**
         * Applies the associated action's
         * [selectionMode]{@link pentaho.visual.action.Select#selectionMode}
         * function to the associated model's
         * [selectionFilter]{@link pentaho.visual.base.Model#selectionFilter} and
         * the action's [dataFilter]{@link pentaho.visual.action.Select#dataFilter}.
         *
         * The resulting data filter is set as the model's new `selectionFilter`.
         *
         * @return {?Promise} - The value `null`.
         * @memberOf pentaho.visual.action.SelectExecution#
         * @protected
         * @override
         */
        _doDefault: function() {

          var view = this.target;
          var model = view.model;

          var selectionFilter = this.action.selectionMode.call(view, model.selectionFilter, this.action.dataFilter);

          // NOTE: see related comment on AbstractModel#selectionFilter.
          model.selectionFilter = selectionFilter && selectionFilter.toDnf();

          return null;
        }
      });

      var View = Complex.extend(/** @lends pentaho.visual.base.View# */{

        /**
         * @name pentaho.visual.base.View.Type
         * @class
         * @extends pentaho.type.Complex.Type
         *
         * @classDesc The base class of view types.
         *
         * For more information see {@link pentaho.visual.base.View}.
         */

        /**
         * @alias View
         * @memberOf pentaho.visual.base
         *
         * @class
         * @extends pentaho.type.Complex
         * @extends pentaho.type.action.impl.Target
         * @implements {pentaho.lang.IDisposable}
         *
         * @abstract
         * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.base.View>} pentaho/visual/base/view
         *
         * @classDesc This is the base class for views of visualizations.
         *
         * A container is expected to instantiate a `View` given a specification with its main properties,
         * like the container DOM element, the `width`, `height` and `model`.
         * The model may not be immediately valid.
         * Alternatively, the container DOM element can be set at a later time,
         * using {@link pentaho.visual.base.View#domContainer}.
         *
         * In any case, the first rendering of the view must be explicitly triggered by a call to
         * [update]{@link pentaho.visual.base.View#update}.
         * This two-phase process allows a _container application_ to further configure a view,
         * for example, registering event listeners,
         * before the initial update.
         *
         * Over time, the view's model is mutated and, in response,
         * the view detects these changes, marks itself as [dirty]{@link pentaho.visual.base.View#isDirty},
         * and, by default, automatically updates itself.
         *
         * In response to the user interacting with the view,
         * it may perform [actions]{@link pentaho.visual.View#act},
         * such as the standard actions
         * [Select]{@link pentaho.visual.action.Select} and
         * [Execute]{@link pentaho.visual.action.Execute},
         * and emit events for these.
         * Note that standard actions come pre-loaded with the `View` class,
         * and can thus be safely constructed synchronously from View derived classes.
         *
         * All registered visual filter types are pre-loaded and can be safely loaded synchronously.
         *
         * When a view is no longer needed,
         * the _container application_ **must** call its [dispose]{@link pentaho.visual.base.View#dispose} method,
         * so that the view can free held _resources_ and not cause memory-leaks.
         *
         * @constructor
         * @description Creates a visualization `View` instance.
         * @param {pentaho.visual.base.spec.IViewEx} [viewSpec] - The extended view specification.
         *
         * @see pentaho.visual.base.spec.IView
         * @see pentaho.visual.base.spec.IViewType
         * @see pentaho.visual.action.Select
         * @see pentaho.visual.action.Execute
         */
        constructor: function(viewSpec) {

          this.base(viewSpec);

          /**
           * The container element where the view is rendered.
           *
           * @type {DOMElement}
           * @readOnly
           * @private
           */
          this.__domContainer = null;

          /**
           * Indicates if the view is automatically updated whenever the model is changed.
           *
           * @type {boolean}
           * @default true
           * @private
           */
          this.__isAutoUpdate = true;

          /**
           * The set of dirty property groups of the view.
           *
           * @type {!pentaho.util.BitSet}
           * @readOnly
           * @private
           */
          this.__dirtyPropGroups = new BitSet(View.PropertyGroups.All); // mark view as initially dirty

          /**
           * The current update action execution, if any; `null`, otherwise.
           *
           * @type {pentaho.type.action.Execution}
           * @private
           */
          this.__updateActionExecution = null;

          // Initialize any special properties provided directly in viewSpec.
          if(viewSpec) {
            if(viewSpec.domContainer != null) this.domContainer = viewSpec.domContainer;
            if(viewSpec.isAutoUpdate != null) this.isAutoUpdate = viewSpec.isAutoUpdate;
          }

          // Let any mixins initialize.
          this._init(viewSpec);
        },

        /**
         * Called when the view is constructed.
         *
         * Override this method, from a configuration mixin class,
         * to perform any initialization.
         *
         * @param {pentaho.visual.base.spec.IViewEx} viewSpec - The view specification provided at construction time,
         * if any.
         * @protected
         */
        _init: function(viewSpec) {
          // NOOP
        },

        // region Properties

        // region domContainer
        /**
         * Gets or sets the container DOM element where the view is rendered.
         *
         * The container element is the viewport through which the view's rendered content is revealed.
         * and is provided empty, for the exclusive use of the view, by the _container application_.
         *
         * Its _content_ is owned by the view,
         * but its attributes (including style) are owned by the container application and
         * must **not** be changed by the view.
         *
         * Its size is controlled by the container application and does not need to be the same as
         * that implied by the visual model's
         * [width]{@link pentaho.visual.base.Model#width} and
         * [height]{@link pentaho.visual.base.Model#height} properties,
         * however, normally, it will.
         *
         * It is the responsibility of the container application to clean up the container element's content,
         * if needed, after the view is disposed of.
         * When disposed of, the view has the responsibility of cleaning up any DOM event handlers it
         * may hold on the container element or any of its children.
         *
         * @type {DOMElement}
         * @readOnly
         * @see pentaho.visual.base.View#_initDomContainer
         * @see pentaho.visual.base.View#_releaseDomContainer
         */
        get domContainer() {
          return this.__domContainer;
        },

        set domContainer(value) {
          if(!value) throw error.argRequired("domContainer");

          if(this.__domContainer) {
            if(value !== this.__domContainer)
              throw error.operInvalid("Cannot change 'domContainer' once set.");
            return;
          }

          // new domContainer

          this.__domContainer = value;

          this._initDomContainer();
        },

        /**
         * Called to initialize the DOM container, when it is set.
         *
         * Can be used to initialize the HTML content and/or to attach event handlers.
         * @protected
         */
        _initDomContainer: function() {
          // NOOP
        },

        /**
         * Called to release any references to the DOM container.
         *
         * It is the responsibility of the container application to clean up the container element's content,
         * when it is no longer needed.
         * On the other hand,
         * it is the responsibility of the view to clean up any DOM event handlers or references
         * it may hold on the container element or any of its children.
         *
         * Currently, this method is automatically called from the
         * [dispose]{@link pentaho.visual.base.View#dispose} method.
         *
         * The default implementation clears the DOM container property and unregisters from any DOM events.
         *
         * If an implementation has additional properties containing DOM nodes, or other attached DOM event handlers,
         * then it **must** override this method (and call base) and set these properties to `null`,
         * so that memory-leaks are not caused.
         *
         * @protected
         */
        _releaseDomContainer: function() {
          this.__domContainer = null;
        },
        // end region

        /**
         * Gets or sets a value that enables or disables automatic updates of the view.
         *
         * When `true`, the view is automatically updated whenever a relevant change in the model occurs.
         * When `false`, the view must be manually updated by calling [update]{@link pentaho.visual.base.View#update}.
         *
         * Setting this property to `true` does **not** cause the view to update in response,
         * if it is currently [dirty]{@link pentaho.visual.base.View#isDirty}.
         * This property only affects the view's behaviour in response to subsequent model changes.
         *
         * @type {boolean}
         */
        get isAutoUpdate() {
          return this.__isAutoUpdate;
        },

        set isAutoUpdate(value) {
          this.__isAutoUpdate = !!value;
        },
        // endregion

        // region State flags
        /**
         * Gets a value that indicates if an update is in progress.
         *
         * @type {boolean}
         * @readOnly
         * @see pentaho.visual.base.View#update
         */
        get isUpdating() {
          return this.__updateActionExecution !== null;
        },

        /**
         * Gets a value that indicates if the view is in a dirty state.
         *
         * A view is _dirty_ during the period after the view's model has changed to until the time the view is updated.
         *
         * During this period, the view **should not** handle any user interaction events,
         * as the user would be acting on an outdated representation of the model.
         *
         * @type {boolean}
         * @readOnly
         *
         * @see pentaho.visual.base.View#isAutoUpdate
         */
        get isDirty() {
          // Because dirty prop groups are cleared optimistically before update methods run,
          // it is needed to use isUpdating to not let that transient non-dirty state show through.
          return this.isUpdating || !this.__dirtyPropGroups.isEmpty;
        },
        // endregion

        // endregion

        // region Changes
        // @override Container
        /** @inheritDoc */
        _onChangeDid: function(changeset) {

          var bitSetNew = new BitSet();

          this._onChangeClassify(bitSetNew, changeset);

          if(!bitSetNew.isEmpty) {

            this.__dirtyPropGroups.set(bitSetNew.get());

            this._onChangeDirty(bitSetNew);
          }

          // emit event

          this.base(changeset);
        },

        /**
         * Called when the view properties have changed.
         *
         * The default implementation marks the view as dirty.
         * More specifically, it marks the _property groups_ of the properties affected by the given changeset as dirty.
         *
         * The recognized property groups are those of
         * [View.PropertyGroups]{@link pentaho.visual.base.View.PropertyGroups}.
         *
         * Implementations can override this method to change the default behavior for some or all of the
         * model and view properties.
         *
         * @see pentaho.visual.base.View#_updateAll
         *
         * @param {!pentaho.util.BitSet} dirtyPropGroups - A bit set of property groups that should be set dirty.
         * Use the values of [View.PropertyGroups]{@link pentaho.visual.base.View.PropertyGroups} as bit values.
         *
         * @param {!pentaho.type.Changeset} changeset - The model's changeset.
         *
         * @protected
         */
        _onChangeClassify: function(dirtyPropGroups, changeset) {

          classify(this.constructor.__PropertyGroupOfProperty, changeset);

          function classify(groupsTree, changeset) {
            if(changeset instanceof ComplexChangeset) {
              changeset.propertyNames.forEach(function(name) {
                var dirtyGroupName;
                var result = groupsTree[name];
                if(result) {
                  switch(typeof result) {
                    case "string":
                      dirtyGroupName = result;
                      break;
                    case "object":
                      return classify(result, changeset.getChange(name));
                    default:
                      throw new Error("Invalid property groups tree.");
                  }
                } else {
                  dirtyGroupName = "General";
                }

                dirtyPropGroups.set(View.PropertyGroups[dirtyGroupName]);
              });
            } else {
              // Whole model swapped?
              dirtyPropGroups.set(groupsTree._ || View.PropertyGroups.General);
            }
          }
        },

        /**
         * Called when a change caused relevant property groups to be marked as dirty.
         *
         * The default implementation auto-updates the view, if possible.
         *
         * @param {!pentaho.util.BitSet} dirtyPropGroups - A bit set of property groups that were changed.
         * Use the values of [View.PropertyGroups]{@link pentaho.visual.base.View.PropertyGroups} as bit values.
         *
         * @protected
         */
        _onChangeDirty: function(dirtyPropGroups) {

          if(this.__domContainer && this.isAutoUpdate) {

            /* eslint dot-notation: 0 */

            this.update()["catch"](function(error) {
              logger.warn("Auto-update was canceled: " + error);
            });
          }
        },
        // endregion

        // @override
        _createActionExecution: function(action) {

          if(action instanceof UpdateAction) {
            // Already updating?
            if(this.__updateActionExecution !== null) {
              throw error.operInvalid("An update action is already executing.");
            }

            return new UpdateActionExecution(action, this);
          }

          if(action instanceof SelectAction) {
            return new SelectActionExecution(action, this);
          }

          return this.base(action);
        },

        // region Update
        /**
         * Updates the view to match its latest state.
         *
         * The [model]{@link pentaho.visual.base.View#model} is part of the state of the view.
         *
         * When [isAutoUpdate]{@link pentaho.visual.base.View#isAutoUpdate} is `true`,
         * any change to the view automatically triggers its update,
         * through a call to this method.
         *
         * The update operation is asynchronous.
         * Even if the implementation completes the update synchronously,
         * completion is only advertised later, asynchronously,
         * through
         * the emission of the action execution's `finally` phase event and
         * the resolution of the returned promise.
         *
         * If the update method is called when the view is already
         * [being updated]{@link pentaho.visual.base.View#isUpdating},
         * the same promise that was returned from the initial call is returned.
         *
         * Otherwise, if the update method is called and
         * the view is not [dirty]{@link pentaho.visual.base.View#isDirty},
         * a fulfilled promise is returned.
         *
         * Otherwise,
         * the update method creates an [Update]{@link pentaho.visual.action.Update}
         * action and executes it.
         * This is done by passing the action to the [act]{@link pentaho.visual.base.View#act},
         * and then returning back the [promise]{@link pentaho.type.action.Execution#promise}
         * of the returned [action execution]{@link pentaho.type.action.Execution}.
         *
         * The update then goes through all of the phases of the execution of an action:
         * `init`, `will`, `do` and `finally`.
         * In each of this phases, the following corresponding methods are called:
         * 1. [_onUpdateInit]{@link pentaho.visual.base.View#_onUpdateInit};
         *    the default implementation does nothing;
         * 2. [_onUpdateWill]{@link pentaho.visual.base.View#_onUpdateWill};
         *    the default implementation emits the `will` phase event of the action's execution;
         * 3. [_onUpdateDo]{@link pentaho.visual.base.View#_onUpdateDo};
         *    the default implementation updates the view, proper;
         * 4. [_onUpdateFinally]{@link pentaho.visual.base.View#_onUpdateFinally};
         *    the default implementation emits the `finally` phase event of the action's execution.
         *
         * Note that no events are emitted for the `init` and `do` phases.
         *
         * During the `init`, `will` and `do` phases,
         * the [isUpdating]{@link pentaho.visual.base.View#isUpdating} property
         * returns `true`.
         *
         * During the `finally` phase, `isUpdating` returns `false`.
         * Also, if the implementation or the event listeners further modify the model,
         * a subsequent update action will eventually be executed.
         *
         * #### Update proper
         *
         * If the update action is not canceled or doesn't fail in the `init` and `will` phases,
         * the `do` phase is entered.
         * It is constituted by an **update loop** which is only exited
         * when either
         * the view is not [dirty]{@link pentaho.visual.base.View#isDirty} anymore
         * or an error occurs.
         *
         * On each iteration of the update loop:
         * 1. If the view is invalid, the update loop ends with a validation error and
         *    the update action is rejected;
         * 2. Otherwise, the "best fit" partial update method is selected and called to update the view;
         * 3. If the selected update method throws an error or returns a rejected promise,
         *    the update action is rejected;
         * 4. If the view is not [dirty]{@link pentaho.visual.base.View#isDirty} anymore,
         *    the update loop ends with success;
         * 5. Repeat.
         *
         * Over the view's lifetime, the very first "partial" update method that is selected is always the
         * full update method: [_updateAll]{@link pentaho.visual.base.View#_updateAll}.
         * Subsequent iterations may select _proper_ partial update methods,
         * such as
         * [_updateSize]{@link pentaho.visual.base.View#_updateSize} or
         * [_updateSelection]{@link pentaho.visual.base.View#_updateSelection}.
         *
         * @return {!Promise} A promise that is fulfilled when the visualization is
         * updated or is rejected in case some error occurs.
         *
         * @fires "pentaho/visual/action/update:{will}"
         * @fires "pentaho/visual/action/update:{finally}"
         *
         * @see pentaho.type.action.Execution
         *
         * @see pentaho.visual.base.View#isAutoUpdate
         * @see pentaho.visual.base.View#isUpdating
         * @see pentaho.visual.base.View#isDirty
         *
         * @see pentaho.visual.base.View#_updateAll
         * @see pentaho.visual.base.View#_updateData
         * @see pentaho.visual.base.View#_updateSize
         * @see pentaho.visual.base.View#_updateSelection
         * @see pentaho.visual.base.View#_updateGeneral
         *
         * @see pentaho.visual.base.View#_onUpdateInit
         * @see pentaho.visual.base.View#_onUpdateWill
         * @see pentaho.visual.base.View#_onUpdateDo
         * @see pentaho.visual.base.View#_onUpdateFinally
         */
        update: function() {

          // Already updating?
          var updateActionExecution = this.__updateActionExecution;
          if(updateActionExecution === null) {
            // Anything to do?
            if(this.__dirtyPropGroups.isEmpty) {
              return Promise.resolve();
            }

            updateActionExecution = this.act(new UpdateAction());
          }

          // Create and execute an update action.
          return updateActionExecution.promise;
        },

        /**
         * Performs the _init_ phase of an update action execution.
         *
         * The default implementation does nothing.
         *
         * @param {!pentaho.type.action.Execution} updateActionExecution - The update action execution.
         *
         * @protected
         */
        _onUpdateInit: function(updateActionExecution) {
        },

        /**
         * Performs the _will_ phase of an update action execution.
         *
         * The default implementation calls
         * [_emitActionPhaseWillEvent]{@link pentaho.type.action.impl.Target#_emitActionPhaseWillEvent}.
         *
         * @param {!pentaho.type.action.Execution} updateActionExecution - The update action execution.
         *
         * @protected
         */
        _onUpdateWill: function(updateActionExecution) {
          this._emitActionPhaseWillEvent(updateActionExecution);
        },

        /**
         * Performs the _do_ phase of an update action execution.
         *
         * The default implementation finally updates the view,
         * if it is [dirty]{@link pentaho.visual.base.View#isDirty} and
         * [valid]{@link pentaho.visual.base.View#$isValid}.
         *
         * @param {!pentaho.type.action.Execution} updateActionExecution - The update action execution.
         *
         * @return {!Promise} A promise that is fulfilled when the update action has completed successfully.
         *
         * @protected
         */
        _onUpdateDo: function(updateActionExecution) {
          return this.__updateLoop();
        },

        /**
         * Performs the _finally_ phase of an update action execution.
         *
         * The default implementation calls
         * [_emitActionPhaseFinallyEvent]{@link pentaho.type.action.impl.Target#_emitActionPhaseFinallyEvent}.
         *
         * @param {!pentaho.type.action.Execution} updateActionExecution - The update action execution.
         *
         * @protected
         */
        _onUpdateFinally: function(updateActionExecution) {
          this._emitActionPhaseFinallyEvent(updateActionExecution);
        },

        /**
         * Performs the visualization update loop.
         *
         * On each iteration,
         * if the set of dirty property groups is empty, then the update loop ends successfully.
         *
         * Otherwise, the model is checked for validity; and, if it is not valid, the update loop is rejected.
         * If, on the other hand, the model is valid,
         * the "best" update method is selected and its completion is awaited.
         *
         * If the selected update method is rejected or throws, the update loop is rejected.
         *
         * Lastly, otherwise, another iteration of the loop is performed.
         *
         * @return {!Promise} A promise that is fulfilled when the update loop has completed successfully.
         *
         * @private
         */
        __updateLoop: function() {

          var dirtyPropGroups = this.__dirtyPropGroups;

          if(dirtyPropGroups.isEmpty) {
            this.__updateActionExecution.done();
            return Promise.resolve();
          }

          var validationErrors = this.validate();
          if(validationErrors) {
            return Promise.reject(new UserError("View model is invalid:\n - " + validationErrors.join("\n - ")));
          }

          // ---

          var updateMethodInfo = this.__selectUpdateMethod(dirtyPropGroups);

          // Assume update succeeds.
          dirtyPropGroups.clear(updateMethodInfo.mask);

          var me = this;

          return promise.wrapCall(this[updateMethodInfo.name], this)
              .then(function() {
                return me.__updateLoop();
              }, function(reason) {

                // Restore
                dirtyPropGroups.set(updateMethodInfo.mask);

                return Promise.reject(reason);
              });
        },

        /**
         * Selects the best update method for a given set of dirty property groups.
         *
         * @param {!pentaho.util.BitSet} dirtyPropGroups - The set of dirty property groups.
         *
         * @return {!Object} The information object of the selected update method.
         *
         * @private
         */
        __selectUpdateMethod: function(dirtyPropGroups) {

          var ViewClass = this.constructor;

          // 1. Is there an exact match?
          var methodInfo = ViewClass.__UpdateMethods[dirtyPropGroups.get()];
          if(!methodInfo) {

            // TODO: A sequence of methods that handles the dirty bits...

            // 2. Find the first method that cleans all (or more) of the dirty bits.
            ViewClass.__UpdateMethodsList.some(function(info) {
              if(dirtyPropGroups.isSubsetOf(info.mask)) {
                methodInfo = info;
                return true;
              }
              return false;
            });

            // At least the _updateAll method is registered. It is able to handle any dirty bits.
            // assert methodInfo
          }

          return methodInfo;
        },
        // endregion

        // region ITarget documentation specialization
        /**
         * Executes a given action with this view as its target and does not wait for its outcome.
         *
         * Emits a structured event of a type equal to the action type's id,
         * with the action as event payload,
         * for each of the action's phases.
         *
         * This method can be given [synchronous]{@link pentaho.type.action.Base.Type#isSync} or asynchronous actions.
         * However, in the latter case, this method is only suitable for _fire-and-forget_ scenarios,
         * where it is not needed to know the outcome of the asynchronous action.
         *
         * @name pentaho.visual.base.View#act
         * @method
         *
         * @example
         *
         * define(function() {
         *
         *   // ...
         *
         *   // Listen to the execute event
         *   view.on("pentaho/visual/action/execute", {
         *
         *     do: function(action) {
         *
         *       var dataFilter = action.dataFilter;
         *
         *       alert("Executed on rows where " + (dataFilter && dataFilter.contentKey));
         *
         *       // Mark action as done.
         *       action.done();
         *     }
         *   });
         *
         *   // ...
         *
         *   // Act "execute" on data rows that have "country" = "us".
         *
         *   view.act({
         *     _: "pentaho/visual/action/execute",
         *     dataFilter: {
         *       _: "isEqual",
         *       p: "country",
         *       v: "us"
         *     }
         *   });
         * });
         *
         * @param {!pentaho.type.action.Base} action - The action to execute.
         *
         * @return {!pentaho.type.action.Base} The given action.
         *
         * @override
         * @see pentaho.visual.base.View#actAsync
         */

        /**
         * Executes a given action with this view as its target and waits for its outcome.
         *
         * Emits a structured event of a type equal to the action type's id,
         * with the action as event payload,
         * for each of the action's phases.
         *
         * This method can be given [synchronous]{@link pentaho.type.action.Base.Type#isSync} or asynchronous actions,
         * and can be used when uniformity in treatment is desired and it is needed to know the outcome of the
         * asynchronous action.
         *
         * @name pentaho.visual.base.View#actAsync
         * @method
         *
         * @param {!pentaho.type.action.Base} action - The action to execute.
         *
         * @return {!Promise} A promise that is fulfilled with the action's
         * [result]{@link pentaho.type.action.Base#result} or rejected with the action's
         * [error]{@link pentaho.type.action.Base#error}.
         *
         * @override
         * @see pentaho.visual.base.View#act
         */
        // endregion

        /**
         * Disposes the view by freeing external resources held by the view.
         *
         * The default implementation calls
         * [_releaseDomContainer]{@link pentaho.visual.base.View#_releaseDomContainer}
         * to release the DOM container.
         */
        dispose: function() {

          if(this.__domContainer) {
            this._releaseDomContainer();
          }
        },

        // region Property groups - instance
        // see Base.js
        /** @inheritDoc */
        extend: function(source, keyArgs) {

          this.base(source, keyArgs);

          if(source) {
            var Subclass = this.constructor;

            O.eachOwn(source, function(v, methodName) {
              var m;
              if(F.is(v) && (m = __reUpdateMethodName.exec(methodName))) {

                var methodCleansBits = __parsePropertyGroupsText(Subclass, m[1]);
                if(methodCleansBits && !Subclass.__UpdateMethods[methodCleansBits]) {
                  var updateMethodInfo = {
                    name: methodName,
                    mask: methodCleansBits
                  };

                  Subclass.__UpdateMethods[methodCleansBits] = updateMethodInfo;
                  Subclass.__UpdateMethodsList.push(updateMethodInfo);

                  Subclass.__UpdateMethodsList.sort(function(a, b) {
                    // Never happens: if(a.mask === b.mask) return 0;
                    return new BitSet(a.mask).isSubsetOf(b.mask) ? -1 : 1;
                  });
                }
              }
            });
          }

          return this;
        },
        // endregion

        $type: /** @lends pentaho.visual.base.View.Type# */{
          isAbstract: true,

          mixins: [TargetMixin],

          props: [
            {
              /**
               * Gets or sets the width that the container application has allocated to display the view
               * without horizontal or vertical scrolling, in pixels.
               *
               * This property is required.
               *
               * @name width
               * @memberOf pentaho.visual.base.View#
               * @type {number}
               */
              name: "width",
              valueType: "number",
              isRequired: true
            },
            {
              /**
               * Gets or sets the height that the container application has allocated to display the view
               * without horizontal or vertical scrolling, in pixels.
               *
               * This property is required.
               *
               * @name height
               * @memberOf pentaho.visual.base.View#
               * @type {number}
               */
              name: "height",
              valueType: "number",
              isRequired: true
            },
            {
              /**
               * Gets or sets the visualization model.
               *
               * This property is required.
               *
               * @name model
               * @memberOf pentaho.visual.base.View#
               * @type {pentaho.visual.base.Model}
               */
              name: "model",
              valueType: VisualModel,
              isRequired: true
            }
          ],

          /** @inheritDoc */
          _init: function(spec, keyArgs) {

            spec = this.base(spec, keyArgs) || spec;

            // ----
            // Block inheritance, with default values

            this.__extension = null;
            this.__extensionEf = undefined;

            return spec;
          },

          // region Extension
          __extension: null,
          __extensionEf: undefined,

          /**
           * Gets or sets extension properties that a View handles directly.
           *
           * Each visualization type should document the extension properties that
           * it honors when specified via this attribute.
           *
           * When set and the model already has [descendant]{@link pentaho.type.Type#hasDescendants} models,
           * an error is thrown.
           *
           * Returns `null` when there are no local extension properties.
           *
           * Note that this attribute is _not_ serialized when serializing a visual model type.
           * It is expected that this attribute is always specified through configuration.
           * Also, generally, there would be problems serializing functions and other objects
           * it can contain.
           *
           * @type {Object}
           *
           * @throws {pentaho.lang.OperationInvalidError} When setting and the model already has
           * [descendant]{@link pentaho.type.Type#hasDescendants} models.
           *
           * @see pentaho.visual.base.View.Type#extensionEffective
           *
           * @see pentaho.visual.base.spec.IViewType#extension
           */
          get extension() {
            return this.__extension;
          },

          set extension(value) {

            this._assertNoSubtypesAttribute("extension");

            this.__extension = value ? Object(value) : null;
            this.__extensionEf = undefined;
          },

          /**
           * Gets the effective extension properties,
           * a merge between the inherited extension properties and the
           * locally specified extension properties.
           *
           * The merging is performed using the rules of the
           * {@link pentaho.util.Spec#merge} method.
           *
           * Returns `null` when there are no local or inherited extension properties.
           *
           * @readOnly
           * @type {Object}
           *
           * @see pentaho.visual.base.View.Type#extension
           */
          get extensionEffective() {
            var effective = this.__extensionEf;
            if(effective === undefined) {
              effective = null;

              var ancestor = this.ancestor;
              if(ancestor.isSubtypeOf(View.type)) {
                var ancestorExtEf = ancestor.extensionEffective;
                if(ancestorExtEf) {
                  effective = {};
                  specUtil.merge(effective, ancestorExtEf);
                }
              }

              if(this.__extension) {
                if(!effective) effective = {};
                specUtil.merge(effective, this.__extension);
              }

              this.__extensionEf = effective;
            }

            return effective;
          }
          // endregion
        }
      }, /** @lends pentaho.visual.base.View */{

        // TODO: convert to use a view spec?
        // region static factory sugar
        /**
         * Creates a view, asynchronously, given its specification.
         *
         * If the view specification has its type annotated inline,
         * a view of that type is built.
         *
         * Otherwise, when the view type is not annotated inline in the specification,
         * if its `model` property is specified with an already instantiated model instance,
         * or with a type annotated specification,
         * that model's type's default view class is used to create a view instance from
         * the given specification.
         * The returned promise is rejected if the provided model specification is
         * not specified or is not type annotated.
         * The returned promise is also rejected if the model type has no registered default view type.
         *
         * Unlike the {@link pentaho.type.Type#createAsync} counterpart method,
         * this static variant can be called to create an instance of any view type,
         * even if it isn't a subtype of `this` one.
         *
         * @param {pentaho.visual.base.spec.IViewEx} viewSpec - The extended view specification.
         *
         * @return {!Promise.<pentaho.visual.base.View>} A promise for a view with the given specification.
         *
         * @rejects {pentaho.lang.ArgumentRequiredError} When `viewSpec` is not specified.
         * @rejects {pentaho.lang.ArgumentRequiredError} When `viewSpec` has no annotated type, inline, and
         * the `model` property is unspecified.
         * @rejects {pentaho.lang.ArgumentRequiredError} When `viewSpec` has no annotated type, inline, and
         * the `model` property is a specification which also does not have its type annotated inline.
         * @rejects {Error} When there isn't a registered default view class for the type of `model`.
         * @rejects {Error} When the registered default view class does not exist or otherwise fails to load
         * by {@link pentaho.type.Context#getAsync}.
         */
        createAsync: function(viewSpec) {
          if(!viewSpec) return Promise.reject(error.argRequired("viewSpec"));

          var promiseViewCtor;

          // View is type annotated, inline?
          if(viewSpec._) {
            promiseViewCtor = this.type.context.getAsync(viewSpec._);
          } else {
            // View has a model specified?
            var modelSpec = viewSpec.model;
            if(!modelSpec) return Promise.reject(error.argRequired("viewSpec.model"));

            var promiseModelCtor;
            // Is it a model specification?
            if(modelSpec.constructor === Object) {
              // No inline type?
              if(!modelSpec._) return Promise.reject(error.argRequired("viewSpec.model._"));

              promiseModelCtor = this.type.context.getAsync(modelSpec._);
            } else {
              // Assume it is a model instance, from which the model type can be read directly.
              promiseModelCtor = Promise.resolve(modelSpec.constructor);
            }

            promiseViewCtor = promiseModelCtor.then(function(Model) {
              return View.getClassAsync(Model.type);
            });
          }

          return promiseViewCtor.then(function(View) {
            return View.type.createAsync(viewSpec);
          });
        },

        /**
         * Gets a promise for the view class (constructor), of the registered default type, if any,
         * for the given model type or identifier.
         *
         * @param {string|!pentaho.visual.base.Model.Type} modelType - The visual model type or its identifier.
         * @return {!Promise.<Class.<pentaho.visual.base.View>>} A promise for a view class of the given model type.
         *
         * @rejects {pentaho.lang.ArgumentRequiredError} When `modelType` is not specified.
         * @rejects {Error} When `modelType` is a string, any error returned by {@link pentaho.type.Context#getAsync}.
         * @rejects {Error} When there isn't a registered default view for `modelType`.
         * @rejects {Error} When the registered default view does not exist or otherwise fails to load
         * by {@link pentaho.type.Context#getAsync}.
         */
        getClassAsync: function(modelType) {

          if(!modelType) return Promise.reject(error.argRequired("modelType"));

          return context
              .getAsync(modelType)
              .then(function(Model) {

                var defaultView = Model.type.defaultViewAbs;
                if(!defaultView) throw new Error("No registered default view.");

                return context.getAsync(defaultView);
              });
        },
        // endregion

        // region Property groups - class
        // see Base.js
        /** @inheritDoc */
        _subclassed: function(Subclass, instSpec, classSpec, keyArgs) {

          // "Inherit" PropertyGroups, __PropertyGroupOfProperty, __UpdateMethods and __UpdateMethodsList properties
          Subclass.PropertyGroups            = Object.create(this.PropertyGroups);
          Subclass.__PropertyGroupOfProperty = Object.create(this.__PropertyGroupOfProperty);
          Subclass.__UpdateMethods           = Object.create(this.__UpdateMethods);
          Subclass.__UpdateMethodsList       = this.__UpdateMethodsList.slice();

          this.base(Subclass, instSpec, classSpec, keyArgs);
        },

        PropertyGroups: O.assignOwn(Object.create(null),
          /**
           * The `PropertyGroups` enumeration contains the entries for the distinct groups of properties that the
           * base [View]{@link pentaho.visual.base.View} class recognizes when categorizing property changes.
           *
           * @alias pentaho.visual.base.View.PropertyGroups
           * @enum {number}
           * @readOnly
           *
           * @see pentaho.visual.base.View#_onChangeClassify
           */
          {
            /**
             * Includes all view and model properties.
             */
            All: ~0,

            /**
             * The group of properties whose changes are ignored,
             * because the view does not visually represent these in any way.
             */
            Ignored: 0,

            /**
             * The group of properties that don't have a more specific property group.
             */
            General: 1,

            /**
             * The group of data-related properties.
             *
             * By default, the only property of this group is the model's
             * [data]{@link pentaho.visual.base.Model#data} property.
             */
            Data: 2,

            /**
             * The group of size-related properties.
             *
             * By default, the properties of this group are
             * the view's [width]{@link pentaho.visual.base.View#width} and
             * [height]{@link pentaho.visual.base.View#height} properties.
             */
            Size: 4,

            /**
             * The group of selection-related properties.
             *
             * By default, the only property of this group is
             * the model's [selectionFilter]{@link pentaho.visual.base.Model#selectionFilter} property.
             */
            Selection:  8
          }),

        // View property path -> Property group name
        __PropertyGroupOfProperty: O.assignOwn(Object.create(null), {
          "selectionMode":   "Ignored",
          "model": {
            "_": "All",
            "data": "Data",
            "selectionFilter": "Selection"
          },
          "width":           "Size",
          "height":          "Size"
        }),

        // bits -> {name: , mask: }
        __UpdateMethods: Object.create(null),

        // [{name: , mask: }, ...]
        __UpdateMethodsList: []
        // endregion
      })
      .implement(/** @lends pentaho.visual.base.View# */{
        // region _updateXyz Methods
        /**
         * Fully renders or updates the view.
         *
         * The first update of a visualization is always a full update.
         *
         * The default implementation does nothing.
         * Implementations **should** override this method and implement a complete rendering of the visualization.
         *
         * Besides implementing this method,
         * implementations should consider implementing one or more of the optional
         * **partial update methods**, like
         * [_updateData]{@link pentaho.visual.base.View#_updateData},
         * [_updateSize]{@link pentaho.visual.base.View#_updateSize},
         * [_updateSelection]{@link pentaho.visual.base.View#_updateSelection} and
         * [_updateGeneral]{@link pentaho.visual.base.View#_updateGeneral}.
         *
         * Other appropriate combinations of these can also be implemented,
         * for example, `_updateSizeAndSelection`,
         * by combining the names of the known property groups: `Data`, `Size`, `Selection` and `General`,
         * with an `And` to form a corresponding method name.
         * For more information on property groups,
         * see [View.PropertyGroups]{@link pentaho.visual.base.View.PropertyGroups}.
         *
         * The [update]{@link pentaho.visual.base.View#update} operation
         * selects the `best fit` partial methods to actually update the view.
         *
         * @protected
         *
         * @see pentaho.visual.base.View#update
         * @see pentaho.visual.base.View.PropertyGroups
         * @see pentaho.visual.base.View#_onChangeClassify
         */
        _updateAll: function() {
        }

        /**
         * Updates the view, taking into account that
         * only the dimensions of the view have changed.
         *
         * This is an **optional** method - there is no base implementation.
         *
         * Implement this method to provide a faster way to resize a view.
         * When not specified, and no other applicable partial update method exists,
         * the full [_updateAll]{@link pentaho.visual.base.View#_updateAll} method is used to update the view.
         *
         * @name _updateSize
         * @memberOf pentaho.visual.base.View#
         * @method
         * @protected
         * @optional
         * @see pentaho.visual.base.View#_updateAll
         */

        /**
         * Updates the view, taking into account that
         * only the selection-related model properties have changed.
         *
         * This is an **optional** method - there is no base implementation.
         *
         * Implement this method to provide a faster way to update the selection of the view.
         * When not specified, and no other applicable partial update method exists,
         * the view is updated using the [_updateAll]{@link pentaho.visual.base.View#_updateAll} method.
         *
         * @name _updateSelection
         * @memberOf pentaho.visual.base.View#
         * @method
         * @protected
         * @optional
         * @see pentaho.visual.base.View#_updateAll
         */

        /**
         * Updates the view, taking into account that
         * only the data-related model properties have changed.
         *
         * This is an **optional** method - there is no base implementation.
         *
         * Implement this method to provide a faster way to update the data displayed by the view.
         * When not specified, and no other applicable partial update method exists,
         * the view is updated using the [_updateAll]{@link pentaho.visual.base.View#_updateAll} method.
         *
         * @name _updateData
         * @memberOf pentaho.visual.base.View#
         * @method
         * @protected
         * @optional
         * @see pentaho.visual.base.View#_updateAll
         */

        /**
         * Updates the view, taking into account that
         * only "general" model properties have changed.
         *
         * This is an **optional** method - there is no base implementation.
         *
         * Implement this method to provide a faster way to update the "general information" displayed by the view.
         * When not specified, and no other applicable partial update method exists,
         * the view is updated using the [_updateAll]{@link pentaho.visual.base.View#_updateAll} method.
         *
         * @name _updateGeneral
         * @memberOf pentaho.visual.base.View#
         * @method
         * @protected
         * @optional
         * @see pentaho.visual.base.View#_updateAll
         */
        // endregion
      })
      .implement({$type: bundle.structured.type});

      return View;
    }
  ];

  /**
   * Parses the custom part of the name of partial update method (like *_updateXyz*).
   *
   * @memberOf pentaho.visual.base.View~
   *
   * @param {Class.<View>} ViewClass - The view class.
   * @param {string} groupNamesText - The part of the method name following the prefix "_update".
   *
   * @return {number} The property group bits corresponding to the method name.
   *
   * @private
   */
  function __parsePropertyGroupsText(ViewClass, groupNamesText) {

    var groupsBits = 0;

    groupNamesText.split("And").forEach(function(groupName) {
      var groupBits = ViewClass.PropertyGroups[groupName];
      if(groupBits == null || isNaN(+groupBits)) {
        logger.warn("There is no registered property group with name '" + groupName + "'.");
      } else {
        groupsBits |= groupBits;
      }
    });

    return groupsBits;
  }
});
